import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

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

    const quote = await prisma.contractorQuote.findUnique({
      where: { id: quoteId },
      include: { project: true },
    });
    if (!quote) {
      return NextResponse.json({ success: false, error: "Quote not found" }, { status: 404 });
    }
    if (quote.projectId !== projectId) {
      return NextResponse.json({ success: false, error: "Quote does not belong to this project" }, { status: 403 });
    }

    const project = quote.project;
    const sqft = parsePropertySize(project.notes);
    const marketRates = getMarketRates(project.propertyType, sqft);
    const analysis = analyzeQuotePrice(quote.totalAmount, marketRates, project.propertyType);

    const existingMeta = safeParse(quote.parsingSummary) || {};
    await prisma.contractorQuote.update({
      where: { id: quoteId },
      data: {
        status: analysis.isFair ? "reviewed" : "parsed",
        warnings: analysis.redFlags.length ? analysis.redFlags.join(" | ") : null,
        notes: analysis.recommendations.length ? analysis.recommendations.join(" | ") : quote.notes,
        parsingSummary: JSON.stringify({
          ...existingMeta,
          analysis,
          assessedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("Error analyzing quote:", error);
    return NextResponse.json({ success: false, error: "Failed to analyze quote" }, { status: 500 });
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
function analyzeQuotePrice(quoteAmount: number, marketRates: any, propertyType: string) {
  const redFlags: string[] = [];
  const recommendations: string[] = [];
  let isFair = false;
  let priceAssessment = "";
  let confidence = 0.85;
  if (quoteAmount < marketRates.low * 0.8) {
    isFair = false;
    priceAssessment = "Significantly below market rate - potential quality concerns";
    redFlags.push("Quote is 20%+ below market low - may indicate cutting corners or hidden costs");
    recommendations.push("Request detailed breakdown of materials and labor costs");
  } else if (quoteAmount < marketRates.low) {
    isFair = true;
    priceAssessment = "Below market rate - good value if quality is verified";
    confidence = 0.75;
    recommendations.push("Verify what's included vs excluded in the quote");
  } else if (quoteAmount <= marketRates.high) {
    isFair = true;
    priceAssessment = "Within market range - fair pricing";
    confidence = 0.9;
    recommendations.push("Fair market price - compare with other quotes for best value");
  } else if (quoteAmount <= marketRates.high * 1.2) {
    isFair = true;
    priceAssessment = "Above market rate - premium pricing";
    confidence = 0.8;
    recommendations.push("Request justification for premium pricing");
  } else {
    isFair = false;
    priceAssessment = "Significantly above market rate - requires justification";
    redFlags.push("Quote is 20%+ above market high - verify all inclusions");
    recommendations.push("Request detailed cost breakdown");
  }
  return {
    isFair,
    confidence,
    priceAssessment,
    redFlags,
    recommendations,
    marketComparison: {
      yourQuote: quoteAmount,
      marketLow: marketRates.low,
      marketAverage: marketRates.average,
      marketHigh: marketRates.high,
    },
  };
}
