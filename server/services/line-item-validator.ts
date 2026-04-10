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
 * Order matters: more specific categories first to avoid misclassification.
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Kitchen Countertop": ["countertop", "counter top", "table top", "kitchen top", "island top", "quartz top", "granite top", "stone top", "sintered top", "solid surface", "worktop", "bench top"],
  "Kitchen Cabinetry": ["cabinet", "cupboard", "kitchen cabinet", "base cabinet", "wall cabinet", "pantry", "top hung", "bottom cabinet", "tall cabinet", "casement", "fridge cabinet", "oven cabinet"],
  "Kitchen Sink & Tap": ["sink", "tap", "faucet", "kitchen sink", "mixer", "water tap", "basin tap", "sink mixer"],
  "Kitchen Hob & Hood": ["hob", "hood", "cooktop", "hood system", "extractor", "chimney hood", "cooker hood", "induction hob", "gas hob"],
  "Bathroom Vanity": ["vanity", "bathroom cabinet", "basin cabinet", "vanity top", "vanity cabinet", "bathroom vanity", "mirror cabinet"],
  "Bathroom Tiling": ["tile", "tiling", "wall tile", "floor tile", "bathroom tile", "homogeneous tile", "ceramic tile", "porcelain tile", "mosaic", "wall tiling", "floor tiling"],
  "Bathroom Fixtures": ["toilet", "basin", "shower", "bidet", "water closet", "WC", "wash basin", "shower set", "shower mixer", "basin mixer", "sanitary", "sanitary ware"],
  "Bathroom Shower Screen": ["shower screen", "glass panel", "shower door", "shower enclosure", "glass door", "shower partition", "shower glass"],
  "Flooring": ["flooring", "vinyl", "laminate floor", "parquet", "tile floor", "floor tile", "floor vinyl", "vinyl flooring", "laminate flooring", "timber floor", "engineered wood floor"],
  "Carpentry": ["carpentry", "built‑in", "wardrobe", "shoe cabinet", "tv console", "study table", "study desk", "entertainment unit", "display cabinet", "bookshelf", "storage cabinet", "bedroom wardrobe", "walk-in wardrobe", "fitted wardrobe"],
  "Electrical Points": ["point", "socket", "power point", "light point", "fan point", "switch", "outlet", "13a", "15a", "20a", "power socket", "light switch", "dimmer", "DB board", "distribution board"],
  "Painting": ["paint", "painting", "wall paint", "ceiling paint", "emulsion", "sealer", "sealant", "undercoat", "primer", "painting work", "painting works"],
  "Plumbing": ["plumbing", "pipe", "drain", "water point", "sanitary", "sewer", "water piping", "sanitary piping", "cold water", "hot water", "drainage", "waste pipe", "soil pipe"],
  "Windows & Doors": ["window", "door", "grille", "casement", "sliding door", "gate", "window grille", "casement window", "sliding window", "bay window", "aluminum window", "timber door", "main door", "bedroom door"],
  "HVAC": ["aircon", "air‑con", "air conditioning", "condenser", "fan coil", "air conditioner", "split unit", "system", "compressor", "refrigerant", "aircon piping", "aircon installation"],
  "Wall Finishes": ["feature wall", "wall panel", "cladding", "wallpaper", "wood panel", "wall cladding", "wall feature", "accent wall", "wall finish", "wall treatment"],
  "Built‑In Furniture": ["built‑in", "custom furniture", "wardrobe", "storage", "shelving", "built-in cabinet", "built-in wardrobe", "built-in shelving", "fitted furniture", "custom cabinet"],
  "Smart Home": ["smart", "home automation", "smart switch", "smart lock", "sensor", "smart home", "home automation system", "smart lighting", "smart thermostat", "video doorbell"],
  "Demolition": ["demolition", "hacking", "dismantle", "remove existing", "strip out", "clear debris", "haulage", "demolish"],
  "Masonry": ["masonry", "plaster", "screed", "cement", "concrete", "render", "wall plaster", "cement screed", "concrete work", "brickwork"],
  "Ceiling": ["ceiling", "false ceiling", "suspended ceiling", "ceiling work", "light box", "ceiling box", "ceiling panel", "ceiling cornice"],
  "Glass Work": ["glass", "glass work", "glass panel", "tempered glass", "glass door", "glass partition", "glass screen"],
};

/**
 * Material keywords for inference.
 * More specific materials should be listed before general ones.
 */
const MATERIAL_KEYWORDS: Record<string, string[]> = {
  "Quartz": ["quartz", "caesarstone", "silestone", "compac", "quartz stone"],
  "Marble": ["marble", "carrara", "calacatta", "statuario", "marble stone"],
  "Granite": ["granite", "granite stone", "black galaxy", "absolute black"],
  "Sintered Stone": ["sintered", "sintered stone", "neolith", "dekton", "lapitec", "sintered slab"],
  "Solid Surface": ["solid surface", "corian", "hi-macs", "acrylic solid surface", "avonite"],
  "Laminate": ["laminate", "laminated", "melamine", "formica", "laminate sheet", "postform"],
  "Solid Wood": ["solid wood", "teak", "oak", "meranti", "nyatoh", "cherry", "walnut", "maple", "beech", "solid timber"],
  "Plywood": ["plywood", "ply", "marine ply", "bwp", "boiling water proof"],
  "MDF": ["mdf", "medium density fibreboard", "hdf", "high density"],
  "Engineered Wood": ["engineered wood", "veneer", "laminated wood", "wood veneer", "laminate wood"],
  "Stainless Steel": ["stainless", "stainless steel", "SS", "304 stainless", "316 stainless", "stainless sink"],
  "Ceramic": ["ceramic", "porcelain", "ceramic tile", "porcelain tile", "glazed ceramic"],
  "Glass": ["glass", "toughened", "tempered", "clear glass", "frosted glass", "mirror", "glass panel"],
  "Acrylic": ["acrylic", "perspex", "plexiglass", "acrylic sheet"],
  "Vinyl": ["vinyl", "PVC", "LVT", "luxury vinyl tile", "vinyl plank", "vinyl flooring"],
  "Composite": ["composite", "quartz composite", "composite material", "composite stone"],
  "Concrete": ["concrete", "microcement", "polished concrete", "cement screed"],
  "Aluminum": ["aluminum", "aluminium", "aluminum frame", "aluminum profile"],
  "UPVC": ["upvc", "pvc", "plastic", "vinyl window", "pvc window"],
  "Wood Plastic Composite": ["wpc", "wood plastic composite", "composite decking"],
  "Tile": ["tile", "ceramic tile", "porcelain tile", "homogeneous", "mosaic", "subway tile"],
  "Paint": ["paint", "emulsion", "sealer", "primer", "undercoat", "nippon", "dulux", "ici"],
  "Sanitary Ware": ["sanitary", "sanitary ware", "toilet", "basin", "shower", "bidet", "water closet"],
  "Electrical": ["wire", "cable", "conduit", "DB", "distribution board", "circuit breaker", "mc", "rcd"],
  "Plumbing": ["pipe", "copper", "PVC pipe", "GI pipe", "PEX", "water pipe", "drain pipe"],
  "Hardware": ["handle", "hinge", "knob", "drawer runner", "blum", "hettich", "soft close"],
  "Lighting": ["led", "light", "lighting", "downlight", "spotlight", "track light", "pendant"],
};

/**
 * Unit keywords for inference.
 */
const UNIT_KEYWORDS: Record<string, string[]> = {
  "ft": ["ft", "foot", "feet", "linear ft", "linear foot", "lf", "run", "foot run", "running foot", "running feet", "l.f."],
  "m": ["m", "meter", "metre", "linear m", "linear meter", "lm", "running meter", "running metre", "l.m."],
  "sq ft": ["sq ft", "sqft", "square foot", "square feet", "sf", "sft", "sq.ft.", "sq. ft.", "ft²", "square ft"],
  "m²": ["m²", "sqm", "square meter", "square metre", "m2", "sq.m.", "sq. m.", "square m"],
  "piece": ["piece", "pc", "each", "unit", "set", "nos", "no.", "item", "lot"],
  "day": ["day", "man‑day", "MD", "labour day", "man day", "worker day", "labor day", "day work", "daily"],
  "hour": ["hour", "hr", "man‑hour", "labour hour", "hourly"],
  "lot": ["lot", "lump sum", "ls", "l.s.", "package", "project"],
  "roll": ["roll", "rl", "roller"],
  "sheet": ["sheet", "sh", "panel", "board"],
  "length": ["length", "lg", "long"],
  "kg": ["kg", "kilogram", "kilo"],
  "l": ["l", "liter", "litre"],
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
    "Kitchen Sink & Tap": "Stainless Steel",
    "Kitchen Hob & Hood": "Induction",
    "Bathroom Vanity": "Laminate",
    "Bathroom Tiling": "Ceramic",
    "Bathroom Fixtures": "Ceramic",
    "Bathroom Shower Screen": "Glass",
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
    "Demolition": "Demolition Work",
    "Masonry": "Cement",
    "Ceiling": "Gypsum Board",
    "Glass Work": "Glass",
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
    "Demolition": "sq ft",
    "Masonry": "sq ft",
    "Ceiling": "sq ft",
    "Glass Work": "piece",
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