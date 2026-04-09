/**
 * Line‑item validator for contractor quotes.
 * 
 * Matches extracted line items against market‑price database to detect
 * overpricing, underpricing, and missing scope.
 * 
 * Key assumptions:
 * - Singapore renovation market (2025‑2026 rates)
 * - Prices are per unit (ft, m, sq ft, piece, etc.)
 * - Material and category are inferred from description keywords
 */

import { MarketPriceService } from "./market-price";
import { estimateCategories, materialOptions, unitOptions } from "@/lib/constants";

export interface ValidatedLineItem {
  originalDescription: string;
  quotedAmount: number | null;
  
  // Inferred details (may be null if parsing fails)
  inferredCategory?: string;
  inferredMaterial?: string;
  inferredQuantity?: number;
  inferredUnit?: string;
  
  // Market comparison
  marketPricePerUnit?: number;
  expectedAmount?: number;
  priceDifference?: number;
  priceRatio?: number; // quoted / expected (null if either missing)
  
  // Assessment
  assessment: "fair" | "overpriced" | "underpriced" | "unknown" | "invalid";
  confidence: number; // 0-1 confidence in inference
  explanation: string;
  
  // Source data for debugging
  matchedKeywords: string[];
}

export interface LineItemValidationSummary {
  validatedItems: ValidatedLineItem[];
  totalQuoted: number;
  totalExpected: number;
  overallDifference: number;
  averagePriceRatio: number; // average of valid ratios
  overpricedItems: number;
  underpricedItems: number;
  fairItems: number;
  unknownItems: number;
  
  // Recommendations
  recommendations: string[];
  redFlags: string[];
}

/**
 * Keywords mapping for category inference.
 * Matched from description (case‑insensitive).
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Kitchen Countertop": ["countertop", "counter top", "table top", "kitchen top", "island top", "quartz top", "granite top"],
  "Kitchen Cabinetry": ["cabinet", "cupboard", "kitchen cabinet", "base cabinet", "wall cabinet", "pantry"],
  "Kitchen Sink & Tap": ["sink", "tap", "faucet", "kitchen sink", "mixer"],
  "Kitchen Hob & Hood": ["hob", "hood", "cooktop", "hood system", "extractor"],
  "Bathroom Vanity": ["vanity", "bathroom cabinet", "basin cabinet", "vanity top"],
  "Bathroom Tiling": ["tile", "tiling", "wall tile", "floor tile", "bathroom tile"],
  "Bathroom Fixtures": ["toilet", "basin", "shower", "bidet", "water closet", "WC"],
  "Bathroom Shower Screen": ["shower screen", "glass panel", "shower door"],
  "Flooring": ["flooring", "vinyl", "laminate floor", "parquet", "tile floor", "floor tile"],
  "Carpentry": ["carpentry", "built‑in", "wardrobe", "shoe cabinet", "tv console", "study table"],
  "Electrical Points": ["point", "socket", "power point", "light point", "fan point", "switch", "outlet"],
  "Painting": ["paint", "painting", "wall paint", "ceiling paint", "emulsion"],
  "Plumbing": ["plumbing", "pipe", "drain", "water point", "sanitary", "sewer"],
  "Windows & Doors": ["window", "door", "grille", "casement", "sliding door", "gate"],
  "HVAC": ["aircon", "air‑con", "air conditioning", "condenser", "fan coil"],
  "Wall Finishes": ["feature wall", "wall panel", "cladding", "wallpaper", "wood panel"],
  "Built‑In Furniture": ["built‑in", "custom furniture", "wardrobe", "storage", "shelving"],
  "Smart Home": ["smart", "home automation", "smart switch", "smart lock", "sensor"],
};

/**
 * Material keywords for inference.
 */
const MATERIAL_KEYWORDS: Record<string, string[]> = {
  "Laminate": ["laminate", "laminated", "melamine"],
  "Quartz": ["quartz"],
  "Marble": ["marble"],
  "Granite": ["granite"],
  "Solid Wood": ["solid wood", "teak", "oak", "meranti", "nyatoh"],
  "Plywood": ["plywood", "ply"],
  "Engineered Wood": ["engineered wood", "veneer", "laminated wood"],
  "Stainless Steel": ["stainless", "stainless steel", "SS"],
  "Ceramic": ["ceramic", "porcelain"],
  "Glass": ["glass", "toughened", "tempered"],
  "Acrylic": ["acrylic", "solid surface"],
  "Sintered Stone": ["sintered", "sintered stone", "neolith", "dekton"],
  "Vinyl": ["vinyl", "PVC", "LVT"],
  "Composite": ["composite", "quartz composite"],
  "Tile": ["tile", "ceramic tile", "porcelain tile"],
};

/**
 * Unit keywords for inference.
 */
const UNIT_KEYWORDS: Record<string, string[]> = {
  "ft": ["ft", "foot", "feet", "linear ft", "linear foot"],
  "m": ["m", "meter", "metre", "linear m", "linear meter"],
  "sq ft": ["sq ft", "sqft", "square foot", "square feet"],
  "m²": ["m²", "sqm", "square meter", "square metre"],
  "piece": ["piece", "pc", "each", "unit", "set"],
  "day": ["day", "man‑day", "MD", "labour day"],
};

/**
 * Extract quantity from description (e.g., "10 ft" → 10).
 */
function extractQuantity(description: string): number | null {
  // Look for patterns like "10 ft", "3.5 m", "2 pieces"
  const quantityMatch = description.match(/(\d+(?:\.\d+)?)\s*(?:ft|m|sq|piece|pc|set|day|unit)/i);
  if (quantityMatch) {
    return parseFloat(quantityMatch[1]);
  }
  
  // Look for standalone numbers before unit keywords
  const words = description.toLowerCase().split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    const word = words[i];
    const nextWord = words[i + 1];
    
    // Check if current word is a number
    if (/^\d+(\.\d+)?$/.test(word)) {
      // Check if next word contains unit indicator
      if (Object.keys(UNIT_KEYWORDS).some(unit => 
        UNIT_KEYWORDS[unit].some(keyword => nextWord.includes(keyword))
      )) {
        return parseFloat(word);
      }
    }
  }
  
  return null;
}

/**
 * Extract unit from description.
 */
function extractUnit(description: string): string | null {
  const lowerDesc = description.toLowerCase();
  
  for (const [unit, keywords] of Object.entries(UNIT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        return unit;
      }
    }
  }
  
  // Default guesses based on category
  return null;
}

/**
 * Infer category from description.
 */
function inferCategory(description: string): { category: string; confidence: number; keywords: string[] } {
  const lowerDesc = description.toLowerCase();
  const matches: Array<{ category: string; score: number; keywords: string[] }> = [];
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matchedKeywords = keywords.filter(keyword => lowerDesc.includes(keyword.toLowerCase()));
    if (matchedKeywords.length > 0) {
      // Score based on number of matched keywords and keyword specificity
      const score = matchedKeywords.length * 0.3 + (matchedKeywords.some(k => k.length > 8) ? 0.2 : 0);
      matches.push({ category, score, keywords: matchedKeywords });
    }
  }
  
  if (matches.length === 0) {
    return { category: "Other", confidence: 0.1, keywords: [] };
  }
  
  // Pick highest score
  const best = matches.reduce((best, current) => current.score > best.score ? current : best);
  
  // Normalize confidence (max ~0.8 for keyword matching alone)
  const confidence = Math.min(0.8, best.score);
  
  return { category: best.category, confidence, keywords: best.keywords };
}

/**
 * Infer material from description.
 */
function inferMaterial(description: string, category: string): { material: string; confidence: number; keywords: string[] } {
  const lowerDesc = description.toLowerCase();
  const matchedKeywords: string[] = [];
  
  for (const [material, keywords] of Object.entries(MATERIAL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
        return { material, confidence: 0.7, keywords: [keyword] };
      }
    }
  }
  
  // If no material found, return default for category
  const defaultMaterials: Record<string, string> = {
    "Kitchen Countertop": "Laminate",
    "Kitchen Cabinetry": "Laminate",
    "Bathroom Vanity": "Laminate",
    "Bathroom Tiling": "Ceramic",
    "Flooring": "Vinyl",
    "Carpentry": "Plywood",
    "Electrical Points": "Power Point",
    "Painting": "Emulsion",
    "Plumbing": "Pipe",
    "Windows & Doors": "Window",
    "HVAC": "Split Unit",
    "Wall Finishes": "Wall Panel",
    "Built‑In Furniture": "Plywood",
    "Smart Home": "Smart Switch",
  };
  
  const defaultMaterial = defaultMaterials[category] || "Standard";
  return { material: defaultMaterial, confidence: 0.3, keywords: [] };
}

/**
 * Validate a single line item.
 */
export async function validateLineItem(
  description: string,
  quotedAmount: number | null
): Promise<ValidatedLineItem> {
  // Step 1: Infer details from description
  const { category: inferredCategory, confidence: catConfidence, keywords: catKeywords } = inferCategory(description);
  const { material: inferredMaterial, confidence: matConfidence, keywords: matKeywords } = inferMaterial(description, inferredCategory);
  const inferredQuantity = extractQuantity(description);
  const inferredUnit = extractUnit(description) || inferDefaultUnit(inferredCategory);
  
  const matchedKeywords = [...catKeywords, ...matKeywords];
  const inferenceConfidence = (catConfidence * 0.6 + matConfidence * 0.4) * 0.8; // Max 0.8 for inference
  
  // Step 2: If we have enough info, look up market price
  let marketPricePerUnit: number | undefined;
  let expectedAmount: number | undefined;
  let priceDifference: number | undefined;
  let priceRatio: number | undefined;
  let assessment: ValidatedLineItem["assessment"] = "unknown";
  let explanation = "";
  
  if (inferredCategory && inferredMaterial && inferredUnit && inferredQuantity && quotedAmount) {
    try {
      marketPricePerUnit = await MarketPriceService.lookup(inferredCategory, inferredMaterial, inferredUnit);
      expectedAmount = marketPricePerUnit * inferredQuantity;
      priceDifference = quotedAmount - expectedAmount;
      priceRatio = quotedAmount / expectedAmount;
      
      // Determine assessment
      if (priceRatio > 1.2) {
        assessment = "overpriced";
        explanation = `Quoted ${formatSGD(quotedAmount)} is ${Math.round((priceRatio - 1) * 100)}% above market range (expected ~${formatSGD(expectedAmount)})`;
      } else if (priceRatio < 0.8) {
        assessment = "underpriced";
        explanation = `Quoted ${formatSGD(quotedAmount)} is ${Math.round((1 - priceRatio) * 100)}% below market range (expected ~${formatSGD(expectedAmount)})`;
      } else {
        assessment = "fair";
        explanation = `Quoted ${formatSGD(quotedAmount)} is within ±20% of market range (expected ~${formatSGD(expectedAmount)})`;
      }
    } catch (error) {
      assessment = "unknown";
      explanation = `Cannot validate: market price not found for ${inferredMaterial} ${inferredCategory} (${inferredUnit})`;
    }
  } else if (!quotedAmount) {
    assessment = "invalid";
    explanation = "Line item has no amount specified";
  } else {
    assessment = "unknown";
    explanation = "Insufficient detail to validate against market rates";
  }
  
  return {
    originalDescription: description,
    quotedAmount,
    inferredCategory,
    inferredMaterial,
    inferredQuantity,
    inferredUnit,
    marketPricePerUnit,
    expectedAmount,
    priceDifference,
    priceRatio,
    assessment,
    confidence: inferenceConfidence,
    explanation,
    matchedKeywords,
  };
}

/**
 * Validate all line items in a quote.
 */
export async function validateAllLineItems(
  lineItems: Array<{ description: string; amount: number | null }>
): Promise<LineItemValidationSummary> {
  const validatedItems = await Promise.all(
    lineItems.map(item => validateLineItem(item.description, item.amount))
  );
  
  // Calculate summary statistics
  const itemsWithAmounts = validatedItems.filter(item => item.quotedAmount !== null);
  const itemsWithRatio = validatedItems.filter(item => item.priceRatio !== undefined);
  
  const totalQuoted = itemsWithAmounts.reduce((sum, item) => sum + (item.quotedAmount || 0), 0);
  const totalExpected = itemsWithRatio.reduce((sum, item) => sum + (item.expectedAmount || 0), 0);
  
  const overpricedItems = validatedItems.filter(item => item.assessment === "overpriced").length;
  const underpricedItems = validatedItems.filter(item => item.assessment === "underpriced").length;
  const fairItems = validatedItems.filter(item => item.assessment === "fair").length;
  const unknownItems = validatedItems.filter(item => item.assessment === "unknown").length;
  
  const averagePriceRatio = itemsWithRatio.length > 0
    ? itemsWithRatio.reduce((sum, item) => sum + (item.priceRatio || 1), 0) / itemsWithRatio.length
    : 1;
  
  // Generate recommendations
  const recommendations: string[] = [];
  const redFlags: string[] = [];
  
  if (overpricedItems > 0) {
    redFlags.push(`${overpricedItems} line item(s) appear significantly overpriced (>20% above market)`);
    recommendations.push("Negotiate the overpriced items or request detailed justification");
  }
  
  if (underpricedItems > 0) {
    recommendations.push(`${underpricedItems} item(s) are underpriced; verify that scope and materials match expectations`);
  }
  
  if (unknownItems > 0) {
    recommendations.push(`${unknownItems} item(s) could not be validated due to insufficient detail`);
  }
  
  if (averagePriceRatio > 1.1) {
    redFlags.push(`Overall quote appears ${Math.round((averagePriceRatio - 1) * 100)}% above market average`);
  }
  
  return {
    validatedItems,
    totalQuoted,
    totalExpected,
    overallDifference: totalQuoted - totalExpected,
    averagePriceRatio,
    overpricedItems,
    underpricedItems,
    fairItems,
    unknownItems,
    recommendations,
    redFlags,
  };
}

/**
 * Infer default unit based on category.
 */
function inferDefaultUnit(category: string): string {
  const defaults: Record<string, string> = {
    "Kitchen Countertop": "ft",
    "Kitchen Cabinetry": "ft",
    "Kitchen Sink & Tap": "piece",
    "Kitchen Hob & Hood": "piece",
    "Bathroom Vanity": "piece",
    "Bathroom Tiling": "sq ft",
    "Bathroom Fixtures": "piece",
    "Bathroom Shower Screen": "piece",
    "Flooring": "sq ft",
    "Carpentry": "ft",
    "Electrical Points": "piece",
    "Painting": "sq ft",
    "Plumbing": "piece",
    "Windows & Doors": "piece",
    "HVAC": "piece",
    "Wall Finishes": "sq ft",
    "Built‑In Furniture": "piece",
    "Smart Home": "piece",
    "Other": "piece",
  };
  
  return defaults[category] || "piece";
}

/**
 * Format SGD amount.
 */
function formatSGD(amount: number): string {
  return `SGD ${amount.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}