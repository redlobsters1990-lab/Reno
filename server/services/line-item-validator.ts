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
  assessment: "fair" | "overpriced" | "underpriced" | "unknown" | "invalid" | "header" | "per-job";
  confidence: number; // 0-1 confidence in inference
  explanation: string;
  
  // Source data for debugging
  matchedKeywords: string[];
}

export interface LineItemValidationSummary {
  validatedItems: ValidatedLineItem[];
  
  // Totals for all priced items
  totalQuoted: number;
  totalExpected: number;
  overallDifference: number;
  
  // Apples-to-apples comparison (only items we could validate)
  comparableQuoted: number;
  comparableExpected: number;
  comparableDifference: number;
  comparableRatio: number;
  comparableItemCount: number;
  
  // Item counts
  totalItems: number;
  headerItems: number;
  pricedItemCount: number;
  overpricedItems: number;
  underpricedItems: number;
  fairItems: number;
  perJobItems: number;
  unknownItems: number;
  invalidItems: number;
  
  // Breakdown by assessment type (with amounts)
  breakdown: {
    header: { count: number; amount: number };
    perJob: { count: number; amount: number };
    unknown: { count: number; amount: number };
    invalid: { count: number; amount: number };
    fair: { count: number; amount: number; expectedAmount: number };
    overpriced: { count: number; amount: number; expectedAmount: number; overage: number };
    underpriced: { count: number; amount: number; expectedAmount: number; underage: number };
  };
  
  // Metrics
  averagePriceRatio: number; // average of valid ratios
  validationCoverage: number; // comparableItems.length / pricedItems.length
  
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
  "lot": ["lot", "lump sum", "ls", "l.s.", "package", "project", "l$", "lot $", "lump $"],
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
  // First, try to detect if this is a header/title (not a priced item)
  if (isLikelyHeader(description)) {
    return null; // Headers don't have quantities
  }
  
  // Look for patterns like "10 ft", "3.5 m", "2 pieces", "10x10", "10 nos", "10pcs", "1 L$"
  // Expanded regex to include more unit patterns and formats
  const quantityMatch = description.match(/(\d+(?:\.\d+)?)\s*(?:x\s*\d+(?:\.\d+)?\s*)?(?:ft|m|sq|piece|pc|pcs|nos|no\.|set|day|unit|hour|hr|lot|ls|l\$|roll|sheet|length|kg|l|lf|lm|sf|sft|sqm|m2)/i);
  if (quantityMatch) {
    return parseFloat(quantityMatch[1]);
  }
  
  // Look for patterns like "10 nos.", "10 pcs" (with punctuation)
  const nosMatch = description.match(/(\d+(?:\.\d+)?)\s*nos?\.?/i);
  if (nosMatch) return parseFloat(nosMatch[1]);
  
  const pcsMatch = description.match(/(\d+(?:\.\d+)?)\s*pcs?\.?/i);
  if (pcsMatch) return parseFloat(pcsMatch[1]);
  
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
  
  // Check for per-job/lump sum items (might not have explicit quantity)
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('lump sum') || lowerDesc.includes('package') || lowerDesc.includes('project') || 
      lowerDesc.includes('job') || lowerDesc.includes('contract') || lowerDesc.includes('scope')) {
    return 1; // Treat as quantity 1 for per-job items
  }
  
  return null;
}

/**
 * Detect if a line item is likely a header/title rather than a priced item.
 */
function isLikelyHeader(description: string): boolean {
  const lowerDesc = description.toLowerCase().trim();
  
  // Headers often:
  // 1. Are in ALL CAPS (at least 70% uppercase)
  const upperCaseRatio = (description.replace(/[^A-Z]/g, '').length / Math.max(1, description.replace(/[^A-Za-z]/g, '').length));
  if (upperCaseRatio > 0.7 && description.length > 5) {
    return true;
  }
  
  // 2. End with colon
  if (description.trim().endsWith(':')) {
    return true;
  }
  
  // 3. Contain header keywords
  const headerKeywords = [
    'scope', 'includes', 'excludes', 'work', 'items', 'description', 'particulars',
    'details', 'summary', 'breakdown', 'schedule', 'phase', 'stage', 'section',
    'category', 'type', 'heading', 'header', 'title', 'subtotal', 'total', 'gst',
    'grand total', 'amount', 'summary of works', 'list of items'
  ];
  
  if (headerKeywords.some(keyword => lowerDesc.includes(keyword))) {
    return true;
  }
  
  // 4. Very short (1-3 words) and doesn't contain numbers or common material/unit words
  const wordCount = lowerDesc.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount <= 3) {
    const hasNumber = /\d/.test(description);
    const hasMaterial = Object.keys(MATERIAL_KEYWORDS).some(mat => 
      MATERIAL_KEYWORDS[mat].some(keyword => lowerDesc.includes(keyword.toLowerCase()))
    );
    const hasUnit = Object.keys(UNIT_KEYWORDS).some(unit =>
      UNIT_KEYWORDS[unit].some(keyword => lowerDesc.includes(keyword.toLowerCase()))
    );
    
    if (!hasNumber && !hasMaterial && !hasUnit) {
      return true;
    }
  }
  
  return false;
}

/**
 * Detect if a line item is labor/installation work.
 */
function isLaborItem(description: string): boolean {
  const lowerDesc = description.toLowerCase();
  const laborKeywords = [
    'labour', 'labor', 'installation', 'install', 'fixing', 'fix', 'erection',
    'erect', 'assembly', 'assemble', 'set up', 'setup', 'mounting', 'mount',
    'hanging', 'hang', 'fitting', 'fit', 'application', 'apply', 'laying', 'lay',
    'painting', 'paint', 'plastering', 'plaster', 'tiling', 'tile', 'carpentry',
    'carpenter', 'electrical', 'electrician', 'plumbing', 'plumber', 'masonry',
    'mason', 'demolition', 'demo', 'removal', 'remove', 'disposal', 'dispose',
    'cleaning', 'clean', 'polishing', 'polish', 'sealing', 'seal', 'waterproofing',
    'waterproof', 'man-day', 'man day', 'worker day', 'labour day', 'man-hour',
    'man hour', 'labour hour', 'hourly', 'daily', 'day rate', 'hour rate'
  ];
  
  return laborKeywords.some(keyword => lowerDesc.includes(keyword));
}

/**
 * Detect if a line item is a per-job/lump sum item.
 */
function isPerJobItem(description: string): boolean {
  const lowerDesc = description.toLowerCase();
  const perJobKeywords = [
    'lump sum', 'ls', 'l.s.', 'package', 'project', 'job', 'contract', 'scope',
    'overall', 'complete', 'full', 'entire', 'whole', 'total', 'comprehensive',
    'turnkey', 'turn-key', 'all-in', 'all in', 'all-inclusive', 'inclusive',
    'flat rate', 'flat fee', 'fixed price', 'fixed cost', 'l$', 'lot $'
  ];
  
  return perJobKeywords.some(keyword => lowerDesc.includes(keyword));
}

/**
 * Detect if a line item is a professional service (engineer, certification, permit, etc.)
 * These should NOT be treated as labor work.
 */
function isProfessionalService(description: string): boolean {
  const lowerDesc = description.toLowerCase();
  const professionalKeywords = [
    'engineer', 'professional', 'endorsement', 'certification', 'certify', 'certificate',
    'permit', 'approval', 'licence', 'license', 'inspection', 'survey', 'report',
    'drawing', 'plan', 'design', 'consultancy', 'consultant', 'architect', 'architectural',
    'structural', 'me&p', 'm&e', 'mechanical & electrical', 'submission', 'authority',
    'bca', 'ura', 'nea', 'pub', 'sp', 'professional fee', 'pe fee', 'pe endorsement',
    'regulation', 'compliance', 'assessment', 'accreditation', 'registration'
  ];
  
  return professionalKeywords.some(keyword => lowerDesc.includes(keyword));
}

/**
 * Estimate labor cost based on description and category.
 */
function estimateLaborCost(description: string, category: string | null, quotedAmount: number | null): {
  estimatedPerDay: number;
  estimatedDays: number;
  estimatedTotal: number;
  confidence: number;
} {
  const lowerDesc = description.toLowerCase();
  
  // Default labor rates for Singapore (2025-2026)
  const laborRates: Record<string, number> = {
    'carpentry': 250,      // SGD per day for carpenter
    'electrical': 300,     // SGD per day for electrician  
    'plumbing': 280,       // SGD per day for plumber
    'painting': 200,       // SGD per day for painter
    'tiling': 220,         // SGD per day for tiler
    'masonry': 240,        // SGD per day for mason
    'demolition': 180,     // SGD per day for demolition worker
    'general': 150,        // SGD per day for general worker
  };
  
  // Try to extract days/quantity from description
  let estimatedDays = 1;
  const dayMatch = lowerDesc.match(/(\d+(?:\.\d+)?)\s*(?:day|man-day|md)/i);
  if (dayMatch) {
    estimatedDays = parseFloat(dayMatch[1]);
  }
  
  // Determine labor type
  let laborType = 'general';
  if (category && laborRates[category.toLowerCase()]) {
    laborType = category.toLowerCase();
  } else {
    // Guess from description
    if (lowerDesc.includes('carpent')) laborType = 'carpentry';
    else if (lowerDesc.includes('electr')) laborType = 'electrical';
    else if (lowerDesc.includes('plumb')) laborType = 'plumbing';
    else if (lowerDesc.includes('paint')) laborType = 'painting';
    else if (lowerDesc.includes('tile')) laborType = 'tiling';
    else if (lowerDesc.includes('mason')) laborType = 'masonry';
    else if (lowerDesc.includes('demo')) laborType = 'demolition';
  }
  
  const estimatedPerDay = laborRates[laborType] || 150;
  const estimatedTotal = estimatedPerDay * estimatedDays;
  
  // Confidence based on how clear the description is
  let confidence = 0.5;
  if (dayMatch) confidence = 0.7;
  if (category) confidence += 0.1;
  if (quotedAmount && Math.abs(quotedAmount - estimatedTotal) / estimatedTotal < 0.5) {
    confidence += 0.1;
  }
  
  return {
    estimatedPerDay,
    estimatedDays,
    estimatedTotal,
    confidence: Math.min(confidence, 0.9)
  };
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
  // Step 0: Check if this is a header/title (not a priced item)
  // Headers are short descriptions without amounts
  if (isLikelyHeader(description) && quotedAmount === null) {
    return {
      originalDescription: description,
      quotedAmount,
      inferredCategory: null,
      inferredMaterial: null,
      inferredQuantity: null,
      inferredUnit: null,
      marketPricePerUnit: undefined,
      expectedAmount: undefined,
      priceDifference: undefined,
      priceRatio: undefined,
      assessment: "header",
      confidence: 0.9,
      explanation: "This appears to be a section header or title, not a priced line item",
      matchedKeywords: [],
    };
  }
  
  // Step 1: Infer details from description
  const { category: inferredCategory, confidence: catConfidence, keywords: catKeywords } = inferCategory(description);
  const { material: inferredMaterial, confidence: matConfidence, keywords: matKeywords } = inferMaterial(description, inferredCategory);
  const inferredQuantity = extractQuantity(description);
  const inferredUnit = extractUnit(description) || inferDefaultUnit(inferredCategory);
  
  const matchedKeywords = [...catKeywords, ...matKeywords];
  let inferenceConfidence = (catConfidence * 0.6 + matConfidence * 0.4) * 0.8; // Max 0.8 for inference
  
  // Step 2: Handle special cases
  const isLabor = isLaborItem(description);
  const isPerJob = isPerJobItem(description);
  const isProfessional = isProfessionalService(description);
  
  // Step 3: If we have enough info, look up market price
  let marketPricePerUnit: number | undefined;
  let expectedAmount: number | undefined;
  let priceDifference: number | undefined;
  let priceRatio: number | undefined;
  let assessment: ValidatedLineItem["assessment"] = "unknown";
  let explanation = "";
  
  // Handle professional services (engineer fees, certifications, permits)
  if (isProfessional && quotedAmount) {
    assessment = "per-job";
    explanation = "Professional service fee (engineer, certification, permit, etc.). Market comparison not applicable.";
    expectedAmount = undefined;
    priceRatio = undefined;
  }
  // Handle labor items specially (skip if per‑job or unit="lot")
  else if (isLabor && !isPerJob && inferredUnit !== "lot" && quotedAmount) {
    const laborEstimate = estimateLaborCost(description, inferredCategory, quotedAmount);
    expectedAmount = laborEstimate.estimatedTotal;
    priceDifference = quotedAmount - expectedAmount;
    priceRatio = quotedAmount / expectedAmount;
    
    if (priceRatio > 1.3) {
      assessment = "overpriced";
      explanation = `Labor cost ${formatSGD(quotedAmount)} appears high. Expected ~${formatSGD(expectedAmount)} based on ${laborEstimate.estimatedDays} day(s) at SGD ${laborEstimate.estimatedPerDay}/day for ${inferredCategory || 'general'} work`;
    } else if (priceRatio < 0.7) {
      assessment = "underpriced";
      explanation = `Labor cost ${formatSGD(quotedAmount)} appears low. Expected ~${formatSGD(expectedAmount)} based on ${laborEstimate.estimatedDays} day(s) at SGD ${laborEstimate.estimatedPerDay}/day`;
    } else {
      assessment = "fair";
      explanation = `Labor cost ${formatSGD(quotedAmount)} is reasonable for ${laborEstimate.estimatedDays} day(s) of ${inferredCategory || 'general'} work`;
    }
    
    // Adjust confidence based on labor estimate confidence
    inferenceConfidence = Math.min(inferenceConfidence * (0.5 + laborEstimate.confidence), 0.9);
  }
  // Handle per-job/lump sum items (detected by keywords OR unit="lot")
  else if ((isPerJob || inferredUnit === "lot") && quotedAmount) {
    assessment = "per-job";
    
    // More specific explanations based on item type
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('debris') || lowerDesc.includes('waste') || lowerDesc.includes('rubbish') || lowerDesc.includes('disposal')) {
      explanation = "Debris/waste removal typically includes labor, transportation, and disposal fees. Request breakdown of volume/weight and disposal location.";
    } else if (lowerDesc.includes('engineer') || lowerDesc.includes('professional') || lowerDesc.includes('certification') || lowerDesc.includes('endorsement') || lowerDesc.includes('permit')) {
      explanation = "Professional service fee (engineer, certification, permit, etc.). Market comparison not applicable.";
    } else {
      explanation = "This is a lump sum/per‑job item. Validation requires detailed scope breakdown.";
    }
    
    // For per-job items, we can't calculate expected amount without scope details
    // But we can still note it for the summary
    expectedAmount = undefined;
    priceRatio = undefined;
  }
  // Standard validation for items with sufficient details
  else if (inferredCategory && inferredMaterial && inferredUnit && inferredQuantity && quotedAmount) {
    // Check if unit makes sense for this category (e.g., flooring shouldn't be priced per liter)
    if (!isUnitCompatibleWithCategory(inferredCategory, inferredUnit)) {
      assessment = "unknown";
      explanation = `Cannot validate: unit "${inferredUnit}" doesn't make sense for ${inferredCategory}. This may be a per‑job/lump‑sum item.`;
    } else {
      try {
        marketPricePerUnit = await MarketPriceService.lookup(inferredCategory, inferredMaterial, inferredUnit);
        expectedAmount = marketPricePerUnit * inferredQuantity;
        priceDifference = quotedAmount - expectedAmount;
        priceRatio = quotedAmount / expectedAmount;
        
        // Sanity check: extreme ratios indicate likely inference errors
        if (priceRatio > 10 || priceRatio < 0.1) {
          assessment = "unknown";
          explanation = `Extreme price difference (${priceRatio.toFixed(2)}×) suggests unit or quantity inference error. "${inferredQuantity} ${inferredUnit}" may be incorrect.`;
        }
        // Determine assessment (if not marked unknown by sanity check)
        else if (priceRatio > 1.2) {
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
  // Filter out headers (not priced items)
  const pricedItems = validatedItems.filter(item => item.assessment !== "header");
  
  // Items with quoted amounts (excluding headers)
  const itemsWithAmounts = pricedItems.filter(item => item.quotedAmount !== null);
  
  // Items where we can calculate expected amount (standard + labor items)
  const itemsWithExpected = pricedItems.filter(item => item.expectedAmount !== undefined);
  
  // Items for apples-to-apples comparison (have both quoted and expected)
  const comparableItems = pricedItems.filter(item => 
    item.quotedAmount !== null && item.expectedAmount !== undefined
  );
  
  // Calculate totals
  const totalQuotedAll = itemsWithAmounts.reduce((sum, item) => sum + (item.quotedAmount || 0), 0);
  const totalExpectedAll = itemsWithExpected.reduce((sum, item) => sum + (item.expectedAmount || 0), 0);
  
  // Apples-to-apples comparison (only items we could validate)
  const totalQuotedComparable = comparableItems.reduce((sum, item) => sum + (item.quotedAmount || 0), 0);
  const totalExpectedComparable = comparableItems.reduce((sum, item) => sum + (item.expectedAmount || 0), 0);
  const comparableDifference = totalQuotedComparable - totalExpectedComparable;
  const comparableRatio = totalExpectedComparable > 0 ? totalQuotedComparable / totalExpectedComparable : 1;
  
  // Count items by assessment type
  const headerItems = validatedItems.filter(item => item.assessment === "header").length;
  const overpricedItems = pricedItems.filter(item => item.assessment === "overpriced").length;
  const underpricedItems = pricedItems.filter(item => item.assessment === "underpriced").length;
  const fairItems = pricedItems.filter(item => item.assessment === "fair").length;
  const perJobItems = pricedItems.filter(item => item.assessment === "per-job").length;
  const unknownItems = pricedItems.filter(item => item.assessment === "unknown").length;
  const invalidItems = pricedItems.filter(item => item.assessment === "invalid").length;
  
  // Calculate average price ratio for comparable items
  const itemsWithRatio = pricedItems.filter(item => item.priceRatio !== undefined);
  const averagePriceRatio = itemsWithRatio.length > 0
    ? itemsWithRatio.reduce((sum, item) => sum + (item.priceRatio || 1), 0) / itemsWithRatio.length
    : 1;
  
  // Generate recommendations
  const recommendations: string[] = [];
  const redFlags: string[] = [];
  
  if (headerItems > 0) {
    recommendations.push(`${headerItems} header/title item(s) detected and excluded from validation`);
  }
  
  if (overpricedItems > 0) {
    redFlags.push(`${overpricedItems} line item(s) appear significantly overpriced (>20% above market)`);
    recommendations.push("Negotiate the overpriced items or request detailed justification");
  }
  
  if (underpricedItems > 0) {
    recommendations.push(`${underpricedItems} item(s) are underpriced; verify that scope and materials match expectations`);
  }
  
  if (perJobItems > 0) {
    redFlags.push(`${perJobItems} lump sum/per-job item(s) identified`);
    recommendations.push("Request detailed breakdown for lump sum items to validate pricing");
  }
  
  if (unknownItems > 0) {
    recommendations.push(`${unknownItems} item(s) could not be validated due to insufficient detail`);
  }
  
  if (comparableRatio > 1.15 && comparableItems.length > 0) {
    redFlags.push(`Validated portion of quote appears ${Math.round((comparableRatio - 1) * 100)}% above market average`);
  } else if (comparableRatio < 0.85 && comparableItems.length > 0) {
    recommendations.push(`Validated portion of quote appears ${Math.round((1 - comparableRatio) * 100)}% below market average - verify scope completeness`);
  }
  
  // Calculate breakdown by assessment type
  const breakdown = {
    header: {
      count: headerItems,
      amount: validatedItems
        .filter(item => item.assessment === "header" && item.quotedAmount !== null)
        .reduce((sum, item) => sum + (item.quotedAmount || 0), 0)
    },
    perJob: {
      count: perJobItems,
      amount: pricedItems
        .filter(item => item.assessment === "per-job" && item.quotedAmount !== null)
        .reduce((sum, item) => sum + (item.quotedAmount || 0), 0)
    },
    unknown: {
      count: unknownItems,
      amount: pricedItems
        .filter(item => item.assessment === "unknown" && item.quotedAmount !== null)
        .reduce((sum, item) => sum + (item.quotedAmount || 0), 0)
    },
    invalid: {
      count: invalidItems,
      amount: pricedItems
        .filter(item => item.assessment === "invalid" && item.quotedAmount !== null)
        .reduce((sum, item) => sum + (item.quotedAmount || 0), 0)
    },
    fair: {
      count: fairItems,
      amount: pricedItems
        .filter(item => item.assessment === "fair" && item.quotedAmount !== null)
        .reduce((sum, item) => sum + (item.quotedAmount || 0), 0),
      expectedAmount: pricedItems
        .filter(item => item.assessment === "fair" && item.expectedAmount !== undefined)
        .reduce((sum, item) => sum + (item.expectedAmount || 0), 0)
    },
    overpriced: {
      count: overpricedItems,
      amount: pricedItems
        .filter(item => item.assessment === "overpriced" && item.quotedAmount !== null)
        .reduce((sum, item) => sum + (item.quotedAmount || 0), 0),
      expectedAmount: pricedItems
        .filter(item => item.assessment === "overpriced" && item.expectedAmount !== undefined)
        .reduce((sum, item) => sum + (item.expectedAmount || 0), 0),
      overage: pricedItems
        .filter(item => item.assessment === "overpriced" && item.priceDifference !== undefined && item.priceDifference > 0)
        .reduce((sum, item) => sum + (item.priceDifference || 0), 0)
    },
    underpriced: {
      count: underpricedItems,
      amount: pricedItems
        .filter(item => item.assessment === "underpriced" && item.quotedAmount !== null)
        .reduce((sum, item) => sum + (item.quotedAmount || 0), 0),
      expectedAmount: pricedItems
        .filter(item => item.assessment === "underpriced" && item.expectedAmount !== undefined)
        .reduce((sum, item) => sum + (item.expectedAmount || 0), 0),
      underage: pricedItems
        .filter(item => item.assessment === "underpriced" && item.priceDifference !== undefined && item.priceDifference < 0)
        .reduce((sum, item) => sum + Math.abs(item.priceDifference || 0), 0)
    }
  };
  
  return {
    validatedItems,
    
    // Totals for all priced items
    totalQuoted: totalQuotedAll,
    totalExpected: totalExpectedAll,
    overallDifference: totalQuotedAll - totalExpectedAll,
    
    // Apples-to-apples comparison (only items we could validate)
    comparableQuoted: totalQuotedComparable,
    comparableExpected: totalExpectedComparable,
    comparableDifference,
    comparableRatio,
    comparableItemCount: comparableItems.length,
    
    // Item counts
    totalItems: validatedItems.length,
    headerItems,
    pricedItemCount: pricedItems.length,
    overpricedItems,
    underpricedItems,
    fairItems,
    perJobItems,
    unknownItems,
    invalidItems,
    
    // Breakdown by assessment type
    breakdown,
    
    // Metrics
    averagePriceRatio,
    validationCoverage: pricedItems.length > 0 ? comparableItems.length / pricedItems.length : 0,
    
    recommendations,
    redFlags,
  };
}

/**
 * Check if a unit is compatible with a category.
 * Prevents nonsensical comparisons like flooring priced per liter.
 */
function isUnitCompatibleWithCategory(category: string, unit: string): boolean {
  // Define compatible units for each category
  const compatibleUnits: Record<string, string[]> = {
    // Area-based categories
    "Flooring": ["sq ft", "m²", "roll", "sheet", "piece", "lot"],
    "Painting": ["sq ft", "m²", "roll", "lot"],
    "Wall Finishes": ["sq ft", "m²", "roll", "sheet", "piece", "lot"],
    "Bathroom Tiling": ["sq ft", "m²", "piece", "lot"],
    "Ceiling": ["sq ft", "m²", "piece", "lot"],
    "Demolition": ["sq ft", "m²", "lot"],
    "Masonry": ["sq ft", "m²", "lot"],
    
    // Linear/length-based categories
    "Kitchen Countertop": ["ft", "m", "piece", "lot"],
    "Kitchen Cabinetry": ["ft", "m", "piece", "lot"],
    "Carpentry": ["ft", "m", "piece", "lot"],
    
    // Piece/unit-based categories
    "Kitchen Sink & Tap": ["piece", "lot"],
    "Kitchen Hob & Hood": ["piece", "lot"],
    "Bathroom Vanity": ["piece", "lot"],
    "Bathroom Fixtures": ["piece", "lot"],
    "Bathroom Shower Screen": ["piece", "lot"],
    "Electrical Points": ["piece", "lot"],
    "Plumbing": ["piece", "length", "lot"],
    "Windows & Doors": ["piece", "lot"],
    "HVAC": ["piece", "lot"],
    "Built‑In Furniture": ["piece", "lot"],
    "Smart Home": ["piece", "lot"],
    "Glass Work": ["piece", "lot"],
    
    // Time-based categories (labor)
    "Other": ["piece", "lot", "day", "hour", "sq ft", "ft", "m"],
  };
  
  // If category not in map, allow any unit (default)
  if (!compatibleUnits[category]) {
    return true;
  }
  
  // Check if unit is compatible
  return compatibleUnits[category].includes(unit);
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