import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

// POST /api/projects/[id]/quotes/[quoteId]/analyze - Analyze a quote with AI
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; quoteId: string } }
) {
  try {
    const { id: projectId, quoteId } = params;

    // Get the quote
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { project: true },
    });

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    if (quote.projectId !== projectId) {
      return NextResponse.json(
        { success: false, error: "Quote does not belong to this project" },
        { status: 403 }
      );
    }

    // Get project details for context
    const project = quote.project;
    const sqft = parsePropertySize(project.notes);
    
    // Get market rates based on property type
    const marketRates = getMarketRates(project.propertyType, sqft);
    
    // Perform AI analysis
    const analysis = analyzeQuotePrice(quote.amount, marketRates, project.propertyType);

    // Update quote with analysis
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: "analyzed",
        analysis: JSON.stringify(analysis),
      },
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Error analyzing quote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze quote" },
      { status: 500 }
    );
  }
}

function parsePropertySize(notes: string | null): number | null {
  const m = notes?.match(/Property size: (\d+)/);
  return m ? parseInt(m[1]) : null;
}

interface MarketRates {
  low: number;
  average: number;
  high: number;
}

function getMarketRates(propertyType: string, sqft: number | null): MarketRates {
  const baseRates: Record<string, { low: number; avg: number; high: number }> = {
    "HDB Resale": { low: 40, avg: 60, high: 90 },
    "HDB BTO": { low: 35, avg: 50, high: 75 },
    "Condo": { low: 60, avg: 90, high: 130 },
    "Landed": { low: 80, avg: 120, high: 180 },
    "Commercial": { low: 50, avg: 75, high: 110 },
  };

  const rate = baseRates[propertyType] || { low: 50, avg: 75, high: 110 };
  const size = sqft || 1000;

  return {
    low: Math.round(rate.low * size),
    average: Math.round(rate.avg * size),
    high: Math.round(rate.high * size),
  };
}

interface QuoteAnalysis {
  isFair: boolean;
  confidence: number;
  priceAssessment: string;
  redFlags: string[];
  recommendations: string[];
  marketComparison: {
    yourQuote: number;
    marketLow: number;
    marketAverage: number;
    marketHigh: number;
  };
}

function analyzeQuotePrice(
  quoteAmount: number,
  marketRates: MarketRates,
  propertyType: string
): QuoteAnalysis {
  const redFlags: string[] = [];
  const recommendations: string[] = [];
  
  // Calculate how much the quote differs from market average
  const diffFromAverage = ((quoteAmount - marketRates.average) / marketRates.average) * 100;
  
  // Determine if price is fair
  let isFair = false;
  let priceAssessment = "";
  let confidence = 0.85;

  if (quoteAmount < marketRates.low * 0.8) {
    // Significantly below market
    isFair = false;
    priceAssessment = "Significantly below market rate - potential quality concerns";
    redFlags.push("Quote is 20%+ below market low - may indicate cutting corners or hidden costs");
    redFlags.push("Verify contractor credentials and insurance coverage");
    recommendations.push("Request detailed breakdown of materials and labor costs");
    recommendations.push("Check references from previous clients");
    recommendations.push("Ensure all necessary permits are included");
  } else if (quoteAmount < marketRates.low) {
    // Below market
    isFair = true;
    priceAssessment = "Below market rate - good value if quality is verified";
    confidence = 0.75;
    recommendations.push("Verify what's included vs excluded in the quote");
    recommendations.push("Check if this is a promotional price for new customers");
  } else if (quoteAmount <= marketRates.high) {
    // Within market range
    isFair = true;
    priceAssessment = "Within market range - fair pricing";
    confidence = 0.9;
    
    if (quoteAmount > marketRates.average * 1.1) {
      recommendations.push("Quote is on the higher end - negotiate for better terms");
      recommendations.push("Ask about premium materials or additional services included");
    } else if (quoteAmount < marketRates.average * 0.9) {
      recommendations.push("Good value quote - verify quality of materials specified");
    } else {
      recommendations.push("Fair market price - compare with other quotes for best value");
    }
  } else if (quoteAmount <= marketRates.high * 1.2) {
    // Above market
    isFair = true;
    priceAssessment = "Above market rate - premium pricing";
    confidence = 0.8;
    recommendations.push("Request justification for premium pricing");
    recommendations.push("Verify if premium materials or extended warranty is included");
    recommendations.push("Compare scope of work with other quotes");
  } else {
    // Significantly above market
    isFair = false;
    priceAssessment = "Significantly above market rate - requires justification";
    redFlags.push("Quote is 20%+ above market high - verify all inclusions");
    recommendations.push("Request detailed cost breakdown");
    recommendations.push("Verify if specialized work or premium materials justify the price");
    recommendations.push("Consider negotiating or seeking alternative quotes");
  }

  // Additional red flags based on property type
  if (propertyType === "HDB BTO" && quoteAmount > 80000) {
    redFlags.push("Quote seems high for BTO - verify if HDB permits and regulations are factored");
  }

  if (propertyType === "Condo" && quoteAmount < 40000) {
    redFlags.push("Quote seems low for condo - check if MCST approval costs are included");
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
