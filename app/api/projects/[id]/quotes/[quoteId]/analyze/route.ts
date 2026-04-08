import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { extractQuoteDocument } from "@/server/services/quote-parser";

const MARKET_RATE_TABLE: Record<string, { low: number; avg: number; high: number }> = {
  "HDB Resale":  { low: 40,  avg: 60,  high: 90  },
  "HDB BTO":     { low: 35,  avg: 50,  high: 75  },
  "Condo":       { low: 60,  avg: 90,  high: 130 },
  "Landed":      { low: 80,  avg: 120, high: 180 },
  "Commercial":  { low: 50,  avg: 75,  high: 110 },
};
const MARKET_RATE_DEFAULT = { low: 50, avg: 75, high: 110 };
const DEFAULT_PROPERTY_SIZE_SQFT = 1000;
const PRICE_BAND_VERY_LOW  = 0.80;
const PRICE_BAND_PREMIUM   = 1.20;
const SEVERE_ISSUES_HIGH_RISK    = 3;
const MAX_EXCLUSIONS_FOR_LOW_RISK = 1;
const MIN_LINE_ITEMS_FOR_SCOPE   = 3;

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
    const marketRates = getMarketRates(quote.project.propertyType, sqft);
    const analysis = analyzeQuoteDocument({ quoteAmount: effectiveAmount, marketRates, parsedDoc, propertyType: quote.project.propertyType });

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

function getMarketRates(propertyType: string, sqft: number | null) {
  const rate = MARKET_RATE_TABLE[propertyType] ?? MARKET_RATE_DEFAULT;
  const size = sqft ?? DEFAULT_PROPERTY_SIZE_SQFT;
  return { low: Math.round(rate.low * size), average: Math.round(rate.avg * size), high: Math.round(rate.high * size) };
}

function analyzeQuoteDocument({ quoteAmount, marketRates, parsedDoc, propertyType }: any) {
  const redFlags: string[] = [...parsedDoc.warnings];
  const recommendations: string[] = [];
  const strengths: string[] = [];

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

  if (parsedDoc.exclusions.length > 0) recommendations.push("Review all exclusions carefully to avoid hidden costs later.");
  if (parsedDoc.paymentTerms.length === 0) recommendations.push("Request a milestone-based payment schedule before signing.");
  if (!parsedDoc.warrantyTerms.length) recommendations.push("Ask the contractor to add workmanship and material warranty terms.");
  if (!parsedDoc.materialsMentions.length) recommendations.push("Request more material detail if finishes or brands are not clearly specified.");

  const decision = buildDecision({ isFair, quoteAmount, marketRates, parsedDoc, redFlags, recommendations });

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
    },
  };
}

function buildDecision({ isFair, quoteAmount, marketRates, parsedDoc, redFlags, recommendations }: any) {
  let riskLevel: "low" | "medium" | "high" = "medium";
  let recommendation = "Proceed only after clarification";

  const severeIssues = [
    parsedDoc.paymentTerms.length === 0,
    parsedDoc.warrantyTerms.length === 0,
    parsedDoc.lineItems.length < MIN_LINE_ITEMS_FOR_SCOPE,
    quoteAmount > marketRates.high * PRICE_BAND_PREMIUM,
    quoteAmount < marketRates.low * PRICE_BAND_VERY_LOW,
  ].filter(Boolean).length;

  if (severeIssues >= SEVERE_ISSUES_HIGH_RISK) {
    riskLevel = "high";
    recommendation = "Do not proceed yet";
  } else if (severeIssues === 0 && isFair && parsedDoc.exclusions.length <= MAX_EXCLUSIONS_FOR_LOW_RISK) {
    riskLevel = "low";
    recommendation = "Proceed";
  } else if (isFair) {
    riskLevel = "medium";
    recommendation = "Proceed, but negotiate";
  }

  const reasons: string[] = [];
  if (isFair) reasons.push("Quoted price is within or near the expected market range.");
  else reasons.push("Quoted price sits outside the expected market range.");
  if (parsedDoc.lineItems.length >= MIN_LINE_ITEMS_FOR_SCOPE) reasons.push("The quote is itemized enough to review scope at a practical level.");
  if (parsedDoc.exclusions.length > 0) reasons.push(`There are ${parsedDoc.exclusions.length} exclusions that could turn into hidden costs.`);
  if (parsedDoc.paymentTerms.length === 0) reasons.push("Payment terms are not clearly stated.");
  if (parsedDoc.warrantyTerms.length === 0) reasons.push("Warranty terms are not clearly stated.");

  const mustClarify: string[] = [];
  if (parsedDoc.exclusions.length > 0) mustClarify.push("Ask the contractor to confirm every exclusion in writing and price any likely add-ons now.");
  if (parsedDoc.paymentTerms.length === 0) mustClarify.push("Request a milestone-based payment schedule instead of vague or front-loaded payments.");
  if (parsedDoc.warrantyTerms.length === 0) mustClarify.push("Request explicit workmanship and material warranty coverage in writing.");
  if (parsedDoc.materialsMentions.length === 0) mustClarify.push("Ask for the exact material brands, models, and finish specifications.");
  if (parsedDoc.lineItems.length < MIN_LINE_ITEMS_FOR_SCOPE) mustClarify.push("Ask for a more detailed line-item breakdown before making a decision.");

  const negotiationPoints: string[] = [];
  if (quoteAmount > marketRates.average) negotiationPoints.push("Use market comparison to negotiate the total closer to the average range.");
  if (parsedDoc.exclusions.length > 0) negotiationPoints.push("Negotiate to include high-probability exclusions now instead of treating them as later variation orders.");
  if (parsedDoc.paymentTerms.length > 0) negotiationPoints.push("Tie payment releases to completed milestones, not just dates.");

  return {
    recommendation,
    riskLevel,
    reasons,
    mustClarify,
    negotiationPoints,
    exclusionGuide: buildExclusionGuide(parsedDoc.exclusions),
  };
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