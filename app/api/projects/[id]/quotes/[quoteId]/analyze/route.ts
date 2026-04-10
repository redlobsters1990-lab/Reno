import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { extractQuoteDocument } from "@/server/services/quote-parser";
import { getCachedMarketRates, isBraveApiAvailable } from "@/server/services/brave-api";
import { validateAllLineItems } from "@/server/services/line-item-validator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quoteId: string }> | { id: string; quoteId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const projectId = resolvedParams?.id;
    const quoteId = resolvedParams?.quoteId;
    if (!projectId || !quoteId) {
      return NextResponse.json({ success: false, error: "Invalid quote or project ID" }, { status: 400 });
    }

    const quote = await prisma.contractorQuote.findUnique({ where: { id: quoteId }, include: { project: true } });
    if (!quote) return NextResponse.json({ success: false, error: "Quote not found" }, { status: 404 });
    if (quote.projectId !== projectId) return NextResponse.json({ success: false, error: "Quote does not belong to this project" }, { status: 403 });

    const meta = safeParse(quote.parsingSummary) || {};
    if (!meta.storagePath || !meta.fileType) {
      return NextResponse.json({ success: false, error: "Uploaded quote file metadata is missing. Please re-upload the quote." }, { status: 400 });
    }

    const parsedDoc = await extractQuoteDocument(meta.storagePath, meta.fileType);
    const effectiveAmount = parsedDoc.totalAmount || quote.totalAmount;
    // Use dedicated propertySize field first, then fall back to notes regex for backwards compat
    const sqft = parsePropertySizeField(quote.project) ?? parsePropertySizeFromNotes(quote.project.notes);
    const marketRates = await getMarketRates(quote.project.propertyType, sqft);
    const analysis = await analyzeQuoteDocument({ quoteAmount: effectiveAmount, marketRates, parsedDoc, propertyType: quote.project.propertyType });

    await prisma.contractorQuote.update({
      where: { id: quoteId },
      data: {
        totalAmount: effectiveAmount,
        contractorName: parsedDoc.contractorName || quote.contractorName,
        status: analysis.isFair ? "reviewed" : "parsed",
        warnings: [...parsedDoc.warnings, ...analysis.redFlags].join(" | ") || null,
        notes: analysis.recommendations.join(" | ") || quote.notes,
        parsingSummary: JSON.stringify({
          ...meta,
          parsedDocument: parsedDoc,
          analysis,
          assessedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ success: true, analysis, parsedDocument: parsedDoc, confidenceBreakdown: analysis.confidenceBreakdown });
  } catch (error) {
    console.error("Error analyzing quote:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze quote";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

function safeParse(value: string | null) {
  try { return value ? JSON.parse(value) : null; } catch { return null; }
}
// Use a dedicated numeric field if the schema has one (future-proof)
function parsePropertySizeField(project: any): number | null {
  if (typeof project.propertySize === "number" && project.propertySize > 0) return project.propertySize;
  return null;
}
// Backwards-compat: extract size from notes string
function parsePropertySizeFromNotes(notes: string | null): number | null {
  const m = notes?.match(/Property size: (\d+)/);
  return m ? parseInt(m[1]) : null;
}
// ── Market rate table (SGD per sqft) ────────────────────────────────────────────────────────────
// Source: Singapore renovation industry benchmarks
// Update these when market conditions change — do not hardcode inline.
const MARKET_RATE_TABLE: Record<string, { low: number; avg: number; high: number }> = {
  "HDB Resale":  { low: 40,  avg: 60,  high: 90  },
  "HDB BTO":     { low: 35,  avg: 50,  high: 75  },
  "Condo":       { low: 60,  avg: 90,  high: 130 },
  "Landed":      { low: 80,  avg: 120, high: 180 },
  "Commercial":  { low: 50,  avg: 75,  high: 110 },
};
const MARKET_RATE_DEFAULT        = { low: 50, avg: 75, high: 110 }; // Fallback for unknown types
const DEFAULT_PROPERTY_SIZE_SQFT = 1000; // Used when no property size is available

// ── Price band thresholds (relative to market bounds) ─────────────────────────────────
const PRICE_BAND_VERY_LOW = 0.80; // < 80% of market low  → potential quality concern
const PRICE_BAND_PREMIUM  = 1.20; // > 120% of market high → requires justification

// ── Risk decision thresholds ────────────────────────────────────────────────────────────
const SEVERE_ISSUES_HIGH_RISK     = 3; // ≥ this many severe issues → high risk
const MAX_EXCLUSIONS_FOR_LOW_RISK = 1; // ≤ this many exclusions allowed for low risk
const MIN_LINE_ITEMS_FOR_SCOPE    = 3; // < this many items → scope too vague

async function getMarketRates(propertyType: string, sqft: number | null) {
  // Try to get live market rates from Brave API (cached)
  try {
    const braveRates = await getCachedMarketRates(propertyType);
    const size = sqft ?? DEFAULT_PROPERTY_SIZE_SQFT;
    return { 
      low: Math.round(braveRates.low * size), 
      average: Math.round(braveRates.average * size), 
      high: Math.round(braveRates.high * size),
      source: "brave",
      confidence: braveRates.confidence,
      sources: braveRates.sources
    };
  } catch (error) {
    // Fall back to static table
    console.warn("Brave API unavailable, using static market rates:", error);
    const rate = MARKET_RATE_TABLE[propertyType] ?? MARKET_RATE_DEFAULT;
    const size = sqft ?? DEFAULT_PROPERTY_SIZE_SQFT;
    return { 
      low: Math.round(rate.low * size), 
      average: Math.round(rate.avg * size), 
      high: Math.round(rate.high * size),
      source: "static",
      confidence: 0.5,
      sources: []
    };
  }
}

async function analyzeQuoteDocument({ quoteAmount, marketRates, parsedDoc, propertyType }: any) {
  const redFlags: string[] = [...parsedDoc.warnings];
  const recommendations: string[] = [];
  const strengths: string[] = [];
  
  // Line‑item validation against market‑price database
  let lineItemValidation = null;
  if (parsedDoc.lineItems.length > 0) {
    try {
      lineItemValidation = await validateAllLineItems(parsedDoc.lineItems);
      
      // Add validation insights to recommendations and red flags
      if (lineItemValidation.redFlags.length > 0) {
        redFlags.push(...lineItemValidation.redFlags);
      }
      if (lineItemValidation.recommendations.length > 0) {
        recommendations.push(...lineItemValidation.recommendations);
      }
      
      // Add strength if most items are fair
      if (lineItemValidation.fairItems > 0 && lineItemValidation.overpricedItems === 0) {
        strengths.push(`${lineItemValidation.fairItems} line item(s) validated as fairly priced against market rates.`);
      }
    } catch (error) {
      console.warn("Line‑item validation failed:", error);
      // Continue without validation results
    }
  }

  if (parsedDoc.documentQuality.hasItemization) strengths.push(`Quote includes ${parsedDoc.lineItems.length} identifiable line items.`);
  if (parsedDoc.documentQuality.hasPaymentTerms) strengths.push("Payment terms were detected in the document.");
  if (parsedDoc.documentQuality.hasWarranty) strengths.push("Warranty language was found in the quote.");

  if (parsedDoc.exclusions.length) redFlags.push(`Found ${parsedDoc.exclusions.length} exclusion(s) in the uploaded quote.`);
  if (parsedDoc.lineItems.length < MIN_LINE_ITEMS_FOR_SCOPE) redFlags.push("Quote has very few identifiable line items. Scope may be too vague.");
  if (!parsedDoc.totalAmount) redFlags.push("Could not confidently detect a total amount from the uploaded file.");
  if (parsedDoc.paymentTerms.length === 0) redFlags.push("No clear payment schedule detected in the uploaded quote.");
  if (parsedDoc.warrantyTerms.length === 0) redFlags.push("No clear workmanship/material warranty detected in the quote.");

  let isFair = false;
  let priceAssessment = "";

  // ---------------------------------------------------------------------------
  // Confidence scoring — each weight reflects how much that signal reduces
  // uncertainty in the price assessment:
  //
  //  BASE (0.50)  — minimum baseline; even with zero signals we have market data
  //  +0.15 totalAmount    — most critical: the number we're actually judging
  //  +0.10 itemization    — scope is legible; we can reason about what's included
  //  +0.08 paymentTerms   — structured doc; contractor is professional
  //  +0.07 warranty       — further marker of a complete, professional quote
  //  +0.05 5+ line items  — deeper breakdown = better parsing accuracy
  //  +0.05 10+ line items — detailed itemization nearly eliminates scope guessing
  //  +0.03 contractorName — identity is verifiable in the document
  //  +0.03 materials      — spec detail reduces ambiguity in scope
  //  +0.02 timeline       — minor positive; schedule info = complete document
  //
  //  MAX cap: 0.97 — we never claim 100% certainty (market data has variance)
  // ---------------------------------------------------------------------------
  const CONFIDENCE_BASE          = 0.50;
  const CONF_TOTAL_AMOUNT        = 0.15; // Without a total, the whole assessment is speculative
  const CONF_ITEMIZATION         = 0.10; // Itemized = parseable scope
  const CONF_PAYMENT_TERMS       = 0.08; // Structured payment = professional document
  const CONF_WARRANTY            = 0.07; // Warranty clause = complete document
  const CONF_FIVE_LINE_ITEMS     = 0.05; // Enough items to cross-check scope
  const CONF_TEN_LINE_ITEMS      = 0.05; // Detailed enough to trust line-item parsing
  const CONF_CONTRACTOR_NAME     = 0.03; // Identity confirmed in doc
  const CONF_MATERIALS_MENTIONED = 0.03; // Material spec reduces price ambiguity
  const CONF_TIMELINE_MENTIONED  = 0.02; // Indicates a complete, structured quote
  const CONFIDENCE_MAX           = 0.97; // Never claim certainty — market data varies

  let confidenceScore = CONFIDENCE_BASE;
  if (parsedDoc.totalAmount)                       confidenceScore += CONF_TOTAL_AMOUNT;
  if (parsedDoc.documentQuality.hasItemization)    confidenceScore += CONF_ITEMIZATION;
  if (parsedDoc.documentQuality.hasPaymentTerms)   confidenceScore += CONF_PAYMENT_TERMS;
  if (parsedDoc.documentQuality.hasWarranty)       confidenceScore += CONF_WARRANTY;
  if (parsedDoc.lineItems.length >= 5)             confidenceScore += CONF_FIVE_LINE_ITEMS;
  if (parsedDoc.lineItems.length >= 10)            confidenceScore += CONF_TEN_LINE_ITEMS;
  if (parsedDoc.contractorName)                    confidenceScore += CONF_CONTRACTOR_NAME;
  if (parsedDoc.materialsMentions.length > 0)      confidenceScore += CONF_MATERIALS_MENTIONED;
  if (parsedDoc.timelineMentions.length > 0)       confidenceScore += CONF_TIMELINE_MENTIONED;
  const confidence = Math.min(Math.round(confidenceScore * 100) / 100, CONFIDENCE_MAX);

  // Expose confidence breakdown so the UI can explain it to the user
  const confidenceBreakdown = {
    base: CONFIDENCE_BASE,
    signals: [
      { label: "Total amount detected",    weight: CONF_TOTAL_AMOUNT,        met: !!parsedDoc.totalAmount },
      { label: "Quote is itemized",         weight: CONF_ITEMIZATION,         met: parsedDoc.documentQuality.hasItemization },
      { label: "Payment terms present",     weight: CONF_PAYMENT_TERMS,       met: parsedDoc.documentQuality.hasPaymentTerms },
      { label: "Warranty clause present",   weight: CONF_WARRANTY,            met: parsedDoc.documentQuality.hasWarranty },
      { label: "5+ line items",             weight: CONF_FIVE_LINE_ITEMS,     met: parsedDoc.lineItems.length >= 5 },
      { label: "10+ line items",            weight: CONF_TEN_LINE_ITEMS,      met: parsedDoc.lineItems.length >= 10 },
      { label: "Contractor name in doc",    weight: CONF_CONTRACTOR_NAME,     met: !!parsedDoc.contractorName },
      { label: "Materials mentioned",       weight: CONF_MATERIALS_MENTIONED, met: parsedDoc.materialsMentions.length > 0 },
      { label: "Timeline mentioned",        weight: CONF_TIMELINE_MENTIONED,  met: parsedDoc.timelineMentions.length > 0 },
    ],
    score: confidence,
  };

  if (quoteAmount < marketRates.low * PRICE_BAND_VERY_LOW) {
    priceAssessment = "Significantly below market rate - potential quality concerns";
    redFlags.push("Detected total is well below expected market range.");
  } else if (quoteAmount < marketRates.low) {
    isFair = true;
    priceAssessment = "Below market rate - verify scope and quality carefully";
    recommendations.push("Confirm materials, workmanship level, and exclusions listed in the document.");
  } else if (quoteAmount <= marketRates.high) {
    isFair = true;
    priceAssessment = "Within market range - fair pricing";
    recommendations.push("Compare this quote's line items and exclusions against competing quotes.");
  } else if (quoteAmount <= marketRates.high * PRICE_BAND_PREMIUM) {
    isFair = true;
    priceAssessment = "Above market rate - premium pricing";
    recommendations.push("Ask the contractor to justify the premium using itemized scope and material specifications.");
  } else {
    priceAssessment = "Significantly above market rate - requires justification";
    redFlags.push("Detected total is well above expected market range.");
  }

  // Generate comprehensive recommendations across multiple dimensions
  const recommendationCategories = {
    priceFairness: [],
    documentCompleteness: [],
    scopeClarity: [],
    professionalism: [],
    riskManagement: [],
    negotiationStrategy: [],
  };

  // Price fairness recommendations
  if (quoteAmount < marketRates.low * PRICE_BAND_VERY_LOW) {
    recommendationCategories.priceFairness.push("The quote is significantly below market range. Verify materials quality, workmanship standards, and check for hidden exclusions that might inflate final cost.");
    recommendationCategories.riskManagement.push("Consider requesting contractor references or portfolio to validate quality at this price point.");
  } else if (quoteAmount < marketRates.low) {
    recommendationCategories.priceFairness.push("Price is below typical market range. Confirm all scope items are included and materials meet expected standards.");
    recommendationCategories.negotiationStrategy.push("You may have limited negotiation room but can focus on ensuring scope completeness.");
  } else if (quoteAmount <= marketRates.high) {
    recommendationCategories.priceFairness.push("Price is within fair market range. Focus negotiation on scope clarity and payment terms rather than price reduction.");
  } else if (quoteAmount <= marketRates.high * PRICE_BAND_PREMIUM) {
    recommendationCategories.priceFairness.push("Price is above market average. Request detailed justification for the premium including material brands, workmanship standards, or specialized services.");
    recommendationCategories.negotiationStrategy.push("Ask for itemized breakdown of premium costs to identify potential areas for adjustment.");
  } else {
    recommendationCategories.priceFairness.push("Price is significantly above market range. Require comprehensive justification before considering this quote.");
    recommendationCategories.riskManagement.push("Consider obtaining 2-3 additional quotes to establish a competitive benchmark.");
  }

  // Document completeness recommendations
  if (parsedDoc.exclusions.length > 0) {
    recommendationCategories.documentCompleteness.push(`Review ${parsedDoc.exclusions.length} exclusion(s) carefully. Request contractor to price likely add-ons now to avoid variation orders later.`);
    recommendationCategories.riskManagement.push("Create a contingency budget for excluded items that are likely to be required.");
  }
  
  if (parsedDoc.paymentTerms.length === 0) {
    recommendationCategories.documentCompleteness.push("No payment schedule detected. Request milestone-based payments (e.g., 10% deposit, 40% after demolition, 40% after carpentry, 10% upon completion).");
    recommendationCategories.riskManagement.push("Avoid upfront payments exceeding 20% of total contract value.");
  } else {
    recommendationCategories.professionalism.push("Payment terms are specified, which indicates structured business practices.");
    // Check if payment schedule is reasonable
    const hasFrontHeavyPayment = parsedDoc.paymentTerms.some((term: string) => 
      term.toLowerCase().includes("50%") || term.toLowerCase().includes("60%") || term.toLowerCase().includes("70%")
    );
    if (hasFrontHeavyPayment) {
      recommendationCategories.riskManagement.push("Payment schedule appears front-heavy. Negotiate for more balanced milestone-based payments.");
    }
  }
  
  if (!parsedDoc.warrantyTerms.length) {
    recommendationCategories.documentCompleteness.push("No warranty terms specified. Request minimum 12-month workmanship warranty and material warranties from suppliers.");
    recommendationCategories.riskManagement.push("Ensure warranty terms are documented in the contract before signing.");
  } else {
    recommendationCategories.professionalism.push("Warranty terms are included, providing post-completion protection.");
  }

  // Scope clarity recommendations
  if (!parsedDoc.materialsMentions.length) {
    recommendationCategories.scopeClarity.push("Material specifications are vague. Request detailed material list including brands, models, colors, and finishes.");
    recommendationCategories.negotiationStrategy.push("Use material specification as a negotiation point to either upgrade materials or adjust price.");
  } else {
    recommendationCategories.scopeClarity.push(`Material mentions (${parsedDoc.materialsMentions.length}) provide some scope clarity. Consider requesting even more specific brand/model information.`);
  }
  
  if (parsedDoc.timelineMentions.length === 0) {
    recommendationCategories.scopeClarity.push("No project timeline specified. Request estimated start date, key milestones, and completion date.");
  } else {
    recommendationCategories.professionalism.push("Timeline information provided, indicating project planning.");
  }
  
  if (parsedDoc.lineItems.length < MIN_LINE_ITEMS_FOR_SCOPE) {
    recommendationCategories.scopeClarity.push(`Only ${parsedDoc.lineItems.length} line items detected. Request more detailed breakdown to prevent scope ambiguity and variation claims.`);
    recommendationCategories.riskManagement.push("Vague scope increases risk of disputes and additional charges.");
  } else if (parsedDoc.lineItems.length >= 10) {
    recommendationCategories.scopeClarity.push("Detailed line-item breakdown provides good scope transparency for validation.");
  }

  // Professionalism indicators
  if (parsedDoc.contractorName) {
    recommendationCategories.professionalism.push("Contractor name is clearly identified, which aids verification and accountability.");
  } else {
    recommendationCategories.riskManagement.push("Contractor name not detected. Verify business registration and physical address before proceeding.");
  }
  
  if (parsedDoc.documentQuality.hasItemization) {
    recommendationCategories.professionalism.push("Itemized quote format demonstrates organized business practices.");
  }

  // Line-item validation insights
  if (lineItemValidation) {
    if (lineItemValidation.overpricedItems > 0) {
      recommendationCategories.negotiationStrategy.push(`Use the ${lineItemValidation.overpricedItems} overpriced line items as specific negotiation points to reduce overall cost.`);
    }
    if (lineItemValidation.underpricedItems > 0) {
      recommendationCategories.riskManagement.push(`${lineItemValidation.underpricedItems} items appear underpriced. Verify these items include all required materials and labor.`);
    }
    if (lineItemValidation.unknownItems > 0) {
      recommendationCategories.scopeClarity.push(`${lineItemValidation.unknownItems} items could not be validated. Request more detailed descriptions for these line items.`);
    }
    if (lineItemValidation.fairItems >= parsedDoc.lineItems.length * 0.7) {
      recommendationCategories.priceFairness.push("Most line items appear fairly priced against market rates, supporting overall quote credibility.");
    }
  }

  // Flatten recommendations for backward compatibility
  recommendations.push(...Object.values(recommendationCategories).flat());

  // Detect missing critical scope information
  const missingInformation: string[] = [];
  const text = parsedDoc.text.toLowerCase();
  const lineItemsText = parsedDoc.lineItems.map((li: any) => li.description).join(' ').toLowerCase();
  const allText = text + ' ' + lineItemsText;
  
  // Critical scope items that should be mentioned in any renovation quote
  // Each group contains related keywords - if NONE of them appear, flag as missing
  const criticalItemGroups = [
    {
      keywords: ['waterproof', 'waterproofing', 'water proof', 'water-proof'],
      message: 'Waterproofing scope not clearly specified (critical for wet areas).'
    },
    {
      keywords: ['electrical', 'point', 'socket', 'power point', 'light point', 'switch', 'outlet', 'db board', 'distribution board'],
      message: 'Electrical point count and type not detailed.'
    },
    {
      keywords: ['rewiring', 'rewire', 'wire', 'wiring', 'cable', 'conduit'],
      message: 'Rewiring scope not mentioned (important for older properties).'
    },
    {
      keywords: ['height', 'dimension', 'measurement', 'size', 'h x w x d'],
      message: 'Carpentry/cabinet dimensions not specified.'
    },
    {
      keywords: ['thickness', 'thick', 'mm', 'millimeter'],
      message: 'Countertop/material thickness not specified (affects pricing).'
    },
    {
      keywords: ['tile', 'tiling', 'ceramic', 'porcelain', 'homogeneous', 'mosaic'],
      message: 'Tile type and size not detailed (material, finish, size).'
    },
    {
      keywords: ['paint', 'painting', 'emulsion', 'sealer', 'primer', 'undercoat'],
      message: 'Paint brand and finish not specified.'
    },
    {
      keywords: ['lighting', 'light', 'light point', 'downlight', 'spotlight', 'pendant', 'lamp'],
      message: 'Lighting point count and type not detailed.'
    },
    {
      keywords: ['aircon', 'air conditioning', 'air‑con', 'split unit', 'condenser', 'fan coil'],
      message: 'Air‑conditioning installation scope not mentioned.'
    },
    {
      keywords: ['sanitary', 'toilet', 'basin', 'shower', 'bidet', 'water closet', 'wc', 'vanity'],
      message: 'Sanitary ware specification not detailed.'
    },
    {
      keywords: ['plumbing', 'pipe', 'drain', 'water pipe', 'sanitary pipe', 'sewer', 'drainage'],
      message: 'Plumbing scope not clearly specified.'
    },
    {
      keywords: ['warranty', 'guarantee', 'warrant', 'guaranty'],
      message: 'Warranty terms not clearly stated.'
    },
    {
      keywords: ['payment', 'payment term', 'payment schedule', 'milestone', 'deposit', 'progress payment'],
      message: 'Payment terms not clearly specified.'
    },
    {
      keywords: ['timeline', 'duration', 'schedule', 'start date', 'completion', 'finish date', 'handover'],
      message: 'Project timeline not specified.'
    },
  ];
  
  for (const group of criticalItemGroups) {
    const hasAnyKeyword = group.keywords.some(keyword => allText.includes(keyword));
    if (!hasAnyKeyword) {
      missingInformation.push(group.message);
    }
  }
  
  // If no line items at all, flag as major missing
  if (parsedDoc.lineItems.length === 0) {
    missingInformation.push('No line‑item breakdown provided; scope is too vague for proper validation.');
  }
  
  if (missingInformation.length > 0) {
    recommendations.push("The quote may be missing critical scope details. See missing information below.");
  }

  const decision = buildDecision({ 
    isFair, 
    quoteAmount, 
    marketRates, 
    parsedDoc, 
    redFlags, 
    recommendations,
    missingInformation,
    lineItemValidation
  });

  return {
    isFair,
    confidence,
    confidenceBreakdown,
    priceAssessment,
    strengths,
    redFlags,
    recommendations,
    decision,
    documentInsights: {
      lineItemCount: parsedDoc.lineItems.length,
      exclusionsCount: parsedDoc.exclusions.length,
      paymentTermsCount: parsedDoc.paymentTerms.length,
      warrantyTermsCount: parsedDoc.warrantyTerms.length,
      materialsMentionsCount: parsedDoc.materialsMentions.length,
      timelineMentionsCount: parsedDoc.timelineMentions.length,
    },
    marketComparison: {
      yourQuote: quoteAmount,
      marketLow: marketRates.low,
      marketAverage: marketRates.average,
      marketHigh: marketRates.high,
      source: marketRates.source || "static",
      confidence: marketRates.confidence || 0.5,
      sources: marketRates.sources || [],
    },
    missingInformation,
    lineItemValidation,
    disclaimer: "This analysis validates total amount against market ranges and attempts to validate individual line items against Singapore 2025‑2026 renovation rates. Line‑item validation is based on keyword inference and may have limited accuracy. Actual prices may vary based on material brand, workmanship, site condition, and contractor scope. Validate with contractors before commitment.",
  };
}

function buildDecision({ isFair, quoteAmount, marketRates, parsedDoc, redFlags, recommendations, missingInformation, lineItemValidation }: any) {
  // Calculate risk score based on multiple factors (0-100, lower is better)
  let riskScore = 50; // Neutral starting point
  
  // Price risk: deviation from market average
  const priceDeviation = Math.abs(quoteAmount - marketRates.average) / marketRates.average;
  if (priceDeviation > 0.3) riskScore += 20; // High deviation
  else if (priceDeviation > 0.15) riskScore += 10; // Moderate deviation
  else riskScore -= 5; // Close to market average
  
  // Document completeness risk
  if (parsedDoc.paymentTerms.length === 0) riskScore += 15;
  if (parsedDoc.warrantyTerms.length === 0) riskScore += 15;
  if (parsedDoc.lineItems.length < MIN_LINE_ITEMS_FOR_SCOPE) riskScore += 20;
  if (parsedDoc.contractorName) riskScore -= 5; // Positive factor
  if (parsedDoc.documentQuality.hasItemization) riskScore -= 5;
  
  // Exclusion risk
  riskScore += Math.min(parsedDoc.exclusions.length * 5, 25); // Max 25 points for exclusions
  
  // Missing information risk
  riskScore += Math.min((missingInformation?.length || 0) * 3, 15);
  
  // Line-item validation risk
  if (lineItemValidation) {
    const validationRisk = lineItemValidation.overpricedItems * 3 + lineItemValidation.unknownItems * 2;
    riskScore += Math.min(validationRisk, 20);
  }
  
  // Determine risk level based on score
  let riskLevel: "low" | "medium" | "high" = "medium";
  if (riskScore < 40) riskLevel = "low";
  else if (riskScore > 70) riskLevel = "high";
  
  // Generate recommendation based on risk level and specific issues
  let recommendation = "";
  let nextSteps: string[] = [];
  
  if (riskLevel === "low") {
    recommendation = "This quote appears reasonable with good documentation. You can proceed with contract signing after final verification.";
    nextSteps = [
      "Review contract terms carefully before signing",
      "Confirm start date and project timeline",
      "Document any verbal agreements in writing",
    ];
  } else if (riskLevel === "medium") {
    recommendation = "This quote has some areas requiring clarification before proceeding. Negotiate key points and document agreements.";
    nextSteps = [
      "Address the must-clarify items below before signing",
      "Obtain 1-2 additional quotes for comparison",
      "Request revised quote with clarified scope",
    ];
  } else {
    recommendation = "This quote has significant risk factors. Do not proceed until major issues are resolved.";
    nextSteps = [
      "Address all high-risk items before considering this quote",
      "Obtain 2-3 additional quotes for competitive benchmarking",
      "Consider engaging a different contractor if issues persist",
    ];
  }
  
  // Generate must-clarify items based on specific issues
  const mustClarify: string[] = [];
  
  if (parsedDoc.exclusions.length > 0) {
    mustClarify.push(`Clarify ${parsedDoc.exclusions.length} exclusion(s): request fixed pricing for likely add-ons.`);
  }
  
  if (parsedDoc.paymentTerms.length === 0) {
    mustClarify.push("Establish milestone-based payment schedule (recommended: 10-30-40-20% structure).");
  } else {
    // Check for unreasonable payment terms
    const paymentText = parsedDoc.paymentTerms.join(" ").toLowerCase();
    if (paymentText.includes("50%") || paymentText.includes("60%") || paymentText.includes("70%")) {
      mustClarify.push("Negotiate front-heavy payment schedule to more balanced milestones.");
    }
  }
  
  if (parsedDoc.warrantyTerms.length === 0) {
    mustClarify.push("Specify warranty terms: minimum 12-month workmanship, material warranties.");
  }
  
  if (parsedDoc.materialsMentions.length === 0) {
    mustClarify.push("Request detailed material specifications including brands, models, finishes.");
  }
  
  if (parsedDoc.lineItems.length < MIN_LINE_ITEMS_FOR_SCOPE) {
    mustClarify.push(`Request more detailed breakdown (current: ${parsedDoc.lineItems.length} items, recommended: 10+).`);
  }
  
  if (!parsedDoc.contractorName) {
    mustClarify.push("Verify contractor business registration, address, and references.");
  }
  
  if (missingInformation && missingInformation.length > 0) {
    mustClarify.push(`Address missing scope details: ${Math.min(missingInformation.length, 3)} critical items not specified.`);
  }
  
  if (lineItemValidation?.overpricedItems > 0) {
    mustClarify.push(`Review ${lineItemValidation.overpricedItems} potentially overpriced line items for negotiation.`);
  }
  
  // Generate negotiation points
  const negotiationPoints: string[] = [];
  
  if (quoteAmount > marketRates.average * 1.1) {
    negotiationPoints.push(`Use market comparison (${formatSGD(marketRates.average)} average) to negotiate toward midpoint.`);
  }
  
  if (parsedDoc.exclusions.length > 0) {
    negotiationPoints.push("Negotiate to include high-probability exclusions now at fixed prices.");
  }
  
  if (lineItemValidation?.overpricedItems > 0) {
    negotiationPoints.push(`Focus negotiation on ${lineItemValidation.overpricedItems} specific overpriced items.`);
  }
  
  if (parsedDoc.materialsMentions.length === 0) {
    negotiationPoints.push("Use material specification as leverage: either specify and maintain price, or adjust price for basic materials.");
  }
  
  // Generate reasons for the recommendation
  const reasons: string[] = [];
  
  if (isFair) {
    reasons.push("Price is within acceptable market range.");
  } else if (quoteAmount > marketRates.high) {
    reasons.push("Price exceeds typical market range.");
  } else {
    reasons.push("Price is below typical market range - verify quality.");
  }
  
  if (parsedDoc.lineItems.length >= 10) {
    reasons.push("Detailed itemization provides good scope transparency.");
  } else if (parsedDoc.lineItems.length >= MIN_LINE_ITEMS_FOR_SCOPE) {
    reasons.push("Moderate itemization allows basic scope review.");
  } else {
    reasons.push("Limited itemization increases scope ambiguity risk.");
  }
  
  if (parsedDoc.paymentTerms.length > 0 && parsedDoc.warrantyTerms.length > 0) {
    reasons.push("Payment and warranty terms are specified.");
  } else if (parsedDoc.paymentTerms.length > 0 || parsedDoc.warrantyTerms.length > 0) {
    reasons.push("Some professional terms are included but not comprehensive.");
  } else {
    reasons.push("Missing key professional terms (payment schedule, warranty).");
  }
  
  if (parsedDoc.contractorName) {
    reasons.push("Contractor identity is clear.");
  }
  
  if (missingInformation && missingInformation.length > 0) {
    reasons.push(`${missingInformation.length} critical scope details are missing.`);
  }

  return {
    recommendation,
    riskLevel,
    riskScore: Math.round(riskScore),
    reasons,
    mustClarify,
    negotiationPoints,
    nextSteps,
    exclusionGuide: buildExclusionGuide(parsedDoc.exclusions),
  };
}

// Helper function to format SGD
function formatSGD(amount: number): string {
  return `SGD ${amount.toLocaleString("en-SG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function buildExclusionGuide(exclusions: string[]) {
  return exclusions.map((exclusion) => {
    const lower = exclusion.toLowerCase();

    if (/electrical|rewiring|wiring|power point|lighting/.test(lower)) {
      return {
        exclusion,
        riskLevel: "high",
        whyItMatters: "Electrical exclusions often become expensive variation costs after work starts.",
        askContractor: "Please confirm exactly which electrical works are excluded and provide fixed pricing for common add-ons like rewiring, extra power points, and light relocation.",
        recommendedAction: "Get electrical scope and fixed prices documented before signing.",
      };
    }
    if (/plumbing|pipe|sanitary|waterproof/.test(lower)) {
      return {
        exclusion,
        riskLevel: "high",
        whyItMatters: "Plumbing or waterproofing exclusions can create major hidden cost and defect risk.",
        askContractor: "Please clarify whether plumbing rerouting, waterproofing, and sanitary installation are included. If excluded, what will they cost separately?",
        recommendedAction: "Request written wet-work scope and fixed pricing before proceeding.",
      };
    }
    if (/demolition|haulage|disposal|debris|cart away/.test(lower)) {
      return {
        exclusion,
        riskLevel: "medium",
        whyItMatters: "Disposal exclusions can increase your final bill unexpectedly.",
        askContractor: "Is demolition debris disposal excluded? If so, provide a fixed disposal fee now instead of charging later.",
        recommendedAction: "Ask for disposal and haulage to be included or priced upfront.",
      };
    }
    if (/painting|paint|touch up|skim coat/.test(lower)) {
      return {
        exclusion,
        riskLevel: "medium",
        whyItMatters: "Painting exclusions may leave the project incomplete or add finishing costs later.",
        askContractor: "Which painting works are excluded specifically, and can you add them into the contract with a fixed price?",
        recommendedAction: "Clarify exact paint scope room by room.",
      };
    }
    if (/permit|approval|submission|mcst|hdb/.test(lower)) {
      return {
        exclusion,
        riskLevel: "high",
        whyItMatters: "Permit exclusions can delay the project and shift compliance risk back to you.",
        askContractor: "Who is responsible for HDB/MCST permits and submissions, and what costs are excluded?",
        recommendedAction: "Make permit responsibility explicit before proceeding.",
      };
    }
    if (/material|fixture|appliance|owner supply/.test(lower)) {
      return {
        exclusion,
        riskLevel: "medium",
        whyItMatters: "Material exclusions can make the quote look cheaper than the real project cost.",
        askContractor: "Please identify exactly which materials or fixtures are owner-supplied and estimate their budget impact.",
        recommendedAction: "Add owner-supplied items into your total budget before deciding.",
      };
    }
    return {
      exclusion,
      riskLevel: "medium",
      whyItMatters: "Unclear exclusions often become hidden costs or disputes later in the project.",
      askContractor: "Please explain this exclusion in plain language and confirm what extra cost it could create.",
      recommendedAction: "Get this exclusion clarified in writing before signing.",
    };
  });
}