import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { extractQuoteDocument } from "@/server/services/quote-parser";

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
    const marketRates = getMarketRates(quote.project.propertyType, parsePropertySize(quote.project.notes));
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

    return NextResponse.json({ success: true, analysis, parsedDocument: parsedDoc });
  } catch (error) {
    console.error("Error analyzing quote:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze quote";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

function safeParse(value: string | null) {
  try { return value ? JSON.parse(value) : null; } catch { return null; }
}
function parsePropertySize(notes: string | null): number | null {
  const m = notes?.match(/Property size: (\d+)/);
  return m ? parseInt(m[1]) : null;
}
function getMarketRates(propertyType: string, sqft: number | null) {
  const baseRates: Record<string, { low: number; avg: number; high: number }> = {
    "HDB Resale": { low: 40, avg: 60, high: 90 },
    "HDB BTO": { low: 35, avg: 50, high: 75 },
    "Condo": { low: 60, avg: 90, high: 130 },
    "Landed": { low: 80, avg: 120, high: 180 },
    "Commercial": { low: 50, avg: 75, high: 110 },
  };
  const rate = baseRates[propertyType] || { low: 50, avg: 75, high: 110 };
  const size = sqft || 1000;
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
  if (parsedDoc.lineItems.length < 3) redFlags.push("Quote has very few identifiable line items. Scope may be too vague.");
  if (!parsedDoc.totalAmount) redFlags.push("Could not confidently detect a total amount from the uploaded file.");
  if (parsedDoc.paymentTerms.length === 0) redFlags.push("No clear payment schedule detected in the uploaded quote.");
  if (parsedDoc.warrantyTerms.length === 0) redFlags.push("No clear workmanship/material warranty detected in the quote.");

  let isFair = false;
  let priceAssessment = "";
  let confidence = parsedDoc.totalAmount ? 0.88 : 0.72;

  if (quoteAmount < marketRates.low * 0.8) {
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
  } else if (quoteAmount <= marketRates.high * 1.2) {
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
    parsedDoc.lineItems.length < 3,
    quoteAmount > marketRates.high * 1.2,
    quoteAmount < marketRates.low * 0.8,
  ].filter(Boolean).length;

  if (severeIssues >= 3) {
    riskLevel = "high";
    recommendation = "Do not proceed yet";
  } else if (severeIssues === 0 && isFair && parsedDoc.exclusions.length <= 1) {
    riskLevel = "low";
    recommendation = "Proceed";
  } else if (isFair) {
    riskLevel = "medium";
    recommendation = "Proceed, but negotiate";
  }

  const reasons: string[] = [];
  if (isFair) reasons.push("Quoted price is within or near the expected market range.");
  else reasons.push("Quoted price sits outside the expected market range.");
  if (parsedDoc.lineItems.length >= 3) reasons.push("The quote is itemized enough to review scope at a practical level.");
  if (parsedDoc.exclusions.length > 0) reasons.push(`There are ${parsedDoc.exclusions.length} exclusions that could turn into hidden costs.`);
  if (parsedDoc.paymentTerms.length === 0) reasons.push("Payment terms are not clearly stated.");
  if (parsedDoc.warrantyTerms.length === 0) reasons.push("Warranty terms are not clearly stated.");

  const mustClarify: string[] = [];
  if (parsedDoc.exclusions.length > 0) mustClarify.push("Ask the contractor to confirm every exclusion in writing and price any likely add-ons now.");
  if (parsedDoc.paymentTerms.length === 0) mustClarify.push("Request a milestone-based payment schedule instead of vague or front-loaded payments.");
  if (parsedDoc.warrantyTerms.length === 0) mustClarify.push("Request explicit workmanship and material warranty coverage in writing.");
  if (parsedDoc.materialsMentions.length === 0) mustClarify.push("Ask for the exact material brands, models, and finish specifications.");
  if (parsedDoc.lineItems.length < 3) mustClarify.push("Ask for a more detailed line-item breakdown before making a decision.");

  const negotiationPoints: string[] = [];
  if (quoteAmount > marketRates.average) negotiationPoints.push("Use market comparison to negotiate the total closer to the average range.");
  if (parsedDoc.exclusions.length > 0) negotiationPoints.push("Negotiate to include high-probability exclusions now instead of treating them as later variation orders.");
  if (parsedDoc.paymentTerms.length > 0) negotiationPoints.push("Tie payment releases to completed milestones, not just dates.");

  return { recommendation, riskLevel, reasons, mustClarify, negotiationPoints };
}