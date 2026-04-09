import { prisma } from "@/server/db";

export type MarketPrice = {
  category: string;
  material: string;
  unit: string;
  thickness?: string;  // "20mm", "30mm", "40mm" - for countertops, slabs
  height?: string;     // "half", "full" - for carpentry
  lowPrice: number;
  highPrice: number;
  source: string;
  updatedAt: Date;
};

export const STATIC_PRICES: MarketPrice[] = [
  // Kitchen Countertop (per linear ft) - thickness assumptions noted in source
  // Note: Countertops priced per linear foot assuming standard 2ft depth
  // Sources: Design Authority 2026, Renotalk 2025, Qanvast 2025, Industry Average
  { category: "Kitchen Countertop", material: "Laminate", unit: "ft", thickness: "30mm", lowPrice: 180, highPrice: 300, source: "Design Authority 2026 (30mm laminate with particleboard core)", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Quartz", unit: "ft", thickness: "20mm", lowPrice: 200, highPrice: 400, source: "Design Authority 2026 (20mm standard quartz, SGD 100–200 per sq ft)", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Marble", unit: "ft", thickness: "20mm", lowPrice: 300, highPrice: 600, source: "Industry Average 2025 (20mm marble, SGD 150–300 per sq ft)", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Solid Wood", unit: "ft", thickness: "40mm", lowPrice: 250, highPrice: 500, source: "Renotalk 2025 (40mm butcher block)", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Granite", unit: "ft", thickness: "20mm", lowPrice: 250, highPrice: 450, source: "Industry Average (20mm standard granite)", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Engineered Wood", unit: "ft", thickness: "25mm", lowPrice: 220, highPrice: 400, source: "Industry Average (25mm engineered wood)", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Concrete", unit: "ft", thickness: "30mm", lowPrice: 200, highPrice: 400, source: "Industry Average (30mm cast-in-place)", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Glass", unit: "ft", thickness: "19mm", lowPrice: 300, highPrice: 600, source: "Industry Average (19mm tempered glass)", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Acrylic", unit: "ft", thickness: "30mm", lowPrice: 200, highPrice: 400, source: "Industry Average (30mm solid surface)", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Stone", unit: "ft", thickness: "20mm", lowPrice: 250, highPrice: 500, source: "Industry Average (20mm natural stone)", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Sintered Stone", unit: "ft", thickness: "12mm", lowPrice: 200, highPrice: 400, source: "Design Authority 2026 (12mm sintered stone, SGD 100–200 per sq ft)", updatedAt: new Date() },
  
  // Kitchen Cabinetry (per linear ft) - includes top and bottom cabinets
  // Source: Design Authority 2026 - standard laminate kitchen cabinet run ~$120 per foot
  { category: "Kitchen Cabinetry", material: "Laminate", unit: "ft", lowPrice: 100, highPrice: 180, source: "Design Authority 2026 (laminate cabinet run)", updatedAt: new Date() },
  { category: "Kitchen Cabinetry", material: "Solid Wood", unit: "ft", lowPrice: 200, highPrice: 350, source: "Renotalk 2025 (solid wood cabinets)", updatedAt: new Date() },
  { category: "Kitchen Cabinetry", material: "Plywood", unit: "ft", lowPrice: 80, highPrice: 150, source: "Renotalk 2025 (plywood carcass with laminate)", updatedAt: new Date() },
  { category: "Kitchen Cabinetry", material: "Engineered Wood", unit: "ft", lowPrice: 120, highPrice: 220, source: "Industry Average (engineered wood cabinets)", updatedAt: new Date() },
  { category: "Kitchen Cabinetry", material: "Glass", unit: "ft", lowPrice: 150, highPrice: 300, source: "Industry Average (glass-front cabinets)", updatedAt: new Date() },
  { category: "Kitchen Cabinetry", material: "Acrylic", unit: "ft", lowPrice: 130, highPrice: 250, source: "Industry Average (acrylic finish cabinets)", updatedAt: new Date() },
  
  // Kitchen Sink & Tap (per set)
  { category: "Kitchen Sink & Tap", material: "Stainless Steel", unit: "set", lowPrice: 300, highPrice: 800, source: "Qanvast 2025 (basic to mid-range)", updatedAt: new Date() },
  { category: "Kitchen Sink & Tap", material: "Ceramic", unit: "set", lowPrice: 500, highPrice: 1200, source: "Qanvast 2025 (premium ceramic)", updatedAt: new Date() },
  
  // Kitchen Hob & Hood (per set)
  { category: "Kitchen Hob & Hood", material: "Standard", unit: "set", lowPrice: 800, highPrice: 2000, source: "Industry Average (basic 2-burner hob + hood)", updatedAt: new Date() },
  { category: "Kitchen Hob & Hood", material: "Premium", unit: "set", lowPrice: 2000, highPrice: 5000, source: "Industry Average (induction + chimney hood)", updatedAt: new Date() },
  
  // Kitchen Appliances (per piece) – optional
  { category: "Kitchen Appliances", material: "Oven", unit: "piece", lowPrice: 800, highPrice: 3000, source: "Estimated (built-in oven)", updatedAt: new Date() },
  { category: "Kitchen Appliances", material: "Fridge", unit: "piece", lowPrice: 1000, highPrice: 4000, source: "Estimated (refrigerator)", updatedAt: new Date() },
  
  // Bathroom Vanity (per unit) - includes countertop and cabinet
  { category: "Bathroom Vanity", material: "Laminate", unit: "unit", lowPrice: 800, highPrice: 2000, source: "Renotalk 2025 (basic laminate vanity)", updatedAt: new Date() },
  { category: "Bathroom Vanity", material: "Solid Wood", unit: "unit", lowPrice: 1500, highPrice: 4000, source: "Renotalk 2025 (solid wood vanity)", updatedAt: new Date() },
  
  // Bathroom Tiling (per sq ft)
  { category: "Bathroom Tiling", material: "Ceramic Tile", unit: "sq ft", lowPrice: 6, highPrice: 12, source: "Renotalk 2025 (ceramic wall/floor tiles)", updatedAt: new Date() },
  { category: "Bathroom Tiling", material: "Porcelain Tile", unit: "sq ft", lowPrice: 8, highPrice: 18, source: "Renotalk 2025 (porcelain tiles)", updatedAt: new Date() },
  { category: "Bathroom Tiling", material: "Mosaic", unit: "sq ft", lowPrice: 15, highPrice: 30, source: "Renotalk 2025 (mosaic feature tiles)", updatedAt: new Date() },
  
  // Bathroom Fixtures (per piece)
  { category: "Bathroom Fixtures", material: "Toilet", unit: "piece", lowPrice: 300, highPrice: 1000, source: "Qanvast 2025 (basic to water-saving)", updatedAt: new Date() },
  { category: "Bathroom Fixtures", material: "Basin", unit: "piece", lowPrice: 200, highPrice: 800, source: "Qanvast 2025 (countertop or wall-hung)", updatedAt: new Date() },
  { category: "Bathroom Fixtures", material: "Shower Set", unit: "piece", lowPrice: 400, highPrice: 1500, source: "Qanvast 2025 (rain shower + mixer)", updatedAt: new Date() },
  
  // Bathroom Shower Screen (per unit)
  { category: "Bathroom Shower Screen", material: "Frameless", unit: "unit", lowPrice: 800, highPrice: 2000, source: "Industry Average (frameless glass)", updatedAt: new Date() },
  { category: "Bathroom Shower Screen", material: "Semi‑frameless", unit: "unit", lowPrice: 500, highPrice: 1200, source: "Industry Average (semi-frameless)", updatedAt: new Date() },
  
  // Flooring (per sq ft)
  { category: "Flooring", material: "Vinyl", unit: "sq ft", lowPrice: 4, highPrice: 8, source: "Qanvast 2025 (vinyl plank/ sheet)", updatedAt: new Date() },
  { category: "Flooring", material: "Laminate", unit: "sq ft", lowPrice: 5, highPrice: 10, source: "Qanvast 2025 (laminate flooring)", updatedAt: new Date() },
  { category: "Flooring", material: "Engineered Wood", unit: "sq ft", lowPrice: 8, highPrice: 15, source: "BCA 2024 (engineered wood flooring)", updatedAt: new Date() },
  { category: "Flooring", material: "Ceramic Tile", unit: "sq ft", lowPrice: 6, highPrice: 12, source: "Renotalk 2025 (ceramic floor tiles)", updatedAt: new Date() },
  { category: "Flooring", material: "Porcelain Tile", unit: "sq ft", lowPrice: 8, highPrice: 18, source: "Renotalk 2025 (porcelain floor tiles)", updatedAt: new Date() },
  
  // Lighting (per piece)
  { category: "Lighting", material: "LED", unit: "piece", lowPrice: 100, highPrice: 400, source: "Qanvast 2025 (LED pendant/ceiling light)", updatedAt: new Date() },
  { category: "Lighting", material: "Downlight", unit: "piece", lowPrice: 50, highPrice: 150, source: "Renotalk 2025 (recessed downlight)", updatedAt: new Date() },
  
  // Carpentry (per linear ft) - built-in wardrobes, TV consoles, etc.
  // Height: full-height assumed (floor-to-ceiling). Half-height ~60-70% of price.
  { category: "Carpentry", material: "Plywood", unit: "ft", height: "full", lowPrice: 100, highPrice: 200, source: "Design Authority 2026 (plywood built-in carpentry)", updatedAt: new Date() },
  { category: "Carpentry", material: "Solid Wood", unit: "ft", height: "full", lowPrice: 200, highPrice: 400, source: "Design Authority 2026 (solid wood built-in)", updatedAt: new Date() },
  { category: "Carpentry", material: "Engineered Wood", unit: "ft", height: "full", lowPrice: 120, highPrice: 250, source: "Industry Average (engineered wood carpentry)", updatedAt: new Date() },
  { category: "Carpentry", material: "Melamine", unit: "ft", height: "full", lowPrice: 90, highPrice: 180, source: "Industry Average (melamine finish)", updatedAt: new Date() },
  { category: "Carpentry", material: "MDF", unit: "ft", height: "full", lowPrice: 80, highPrice: 160, source: "Industry Average (MDF built-in)", updatedAt: new Date() },
  
  // Electrical Points (per piece)
  { category: "Electrical Points", material: "Power Point", unit: "piece", lowPrice: 80, highPrice: 150, source: "BCA 2024 (13A power point)", updatedAt: new Date() },
  { category: "Electrical Points", material: "Lighting Point", unit: "piece", lowPrice: 60, highPrice: 120, source: "BCA 2024 (lighting point)", updatedAt: new Date() },
  
  // Painting (per sq ft)
  { category: "Painting", material: "Paint", unit: "sq ft", lowPrice: 2, highPrice: 4, source: "BCA 2024 (emulsion paint, 2 coats)", updatedAt: new Date() },
  { category: "Painting", material: "Wallpaper", unit: "sq ft", lowPrice: 5, highPrice: 12, source: "Qanvast 2025 (wallpaper installation)", updatedAt: new Date() },
  
  // Plumbing (per point)
  { category: "Plumbing", material: "Water Point", unit: "piece", lowPrice: 150, highPrice: 300, source: "BCA 2024 (cold/hot water point)", updatedAt: new Date() },
  { category: "Plumbing", material: "Sanitary Point", unit: "piece", lowPrice: 200, highPrice: 500, source: "BCA 2024 (sanitary plumbing)", updatedAt: new Date() },
  
  // Windows & Doors (per piece)
  { category: "Windows & Doors", material: "Window", unit: "piece", lowPrice: 800, highPrice: 2500, source: "Industry Average (aluminum window)", updatedAt: new Date() },
  { category: "Windows & Doors", material: "Door", unit: "piece", lowPrice: 500, highPrice: 2000, source: "Industry Average (solid core door)", updatedAt: new Date() },
  
  // HVAC (per unit)
  { category: "HVAC", material: "Air‑Con Unit", unit: "piece", lowPrice: 2000, highPrice: 5000, source: "Estimated (system 3/4)", updatedAt: new Date() },
  { category: "HVAC", material: "Fan Coil", unit: "piece", lowPrice: 800, highPrice: 2000, source: "Estimated (fan coil unit)", updatedAt: new Date() },
  
  // Wall Finishes (per sq ft)
  { category: "Wall Finishes", material: "Feature Wall", unit: "sq ft", lowPrice: 20, highPrice: 50, source: "Industry Average (feature wall materials)", updatedAt: new Date() },
  { category: "Wall Finishes", material: "Cladding", unit: "sq ft", lowPrice: 15, highPrice: 40, source: "Industry Average (wall cladding)", updatedAt: new Date() },
  
  // Built‑In Furniture (per unit)
  { category: "Built‑In Furniture", material: "Wardrobe", unit: "unit", lowPrice: 1500, highPrice: 4000, source: "Renotalk 2025 (floor-to-ceiling wardrobe)", updatedAt: new Date() },
  { category: "Built‑In Furniture", material: "TV Console", unit: "unit", lowPrice: 800, highPrice: 2500, source: "Renotalk 2025 (built-in TV console)", updatedAt: new Date() },
  
  // Smart Home (per point)
  { category: "Smart Home", material: "Smart Switch", unit: "piece", lowPrice: 100, highPrice: 300, source: "Estimated (smart switch installation)", updatedAt: new Date() },
  { category: "Smart Home", material: "Sensor", unit: "piece", lowPrice: 80, highPrice: 200, source: "Estimated (motion/light sensor)", updatedAt: new Date() },
];

export class MarketPriceService {
  static async lookup(category: string, material: string, unit: string): Promise<number> {
    // Normalize category and unit for compatibility
    const categoryAliases: Record<string, string> = {
      "Kitchen": "Kitchen Countertop",
      "Bathroom": "Bathroom Tiling",
      "Electrical": "Electrical Points",
      "Tiling": "Bathroom Tiling",
    };
    const unitAliases: Record<string, string> = {
      "sqft": "sq ft",
      "sqm": "m²",
      "linear foot": "ft",
      "foot run": "ft",
      "lm": "m",
      "linear meter": "m",
      "m": "m",
      "each": "piece",
      "pc": "piece",
      "item": "piece",
      "man‑day": "day",
      "MD": "day",
    };
    
    const normalizedCategory = categoryAliases[category] ?? category;
    const normalizedUnit = unitAliases[unit] ?? unit;
    
    // Try database first with normalized values
    const record = await prisma.marketPrice.findFirst({
      where: { category: normalizedCategory, material, unit: normalizedUnit },
      orderBy: { updatedAt: "desc" },
    });
    
    if (record) {
      // Return average of low and high
      return (record.lowPrice + record.highPrice) / 2;
    }
    
    // Fallback to static data – try normalized then original
    const tryMatch = (cat: string, mat: string, un: string) =>
      STATIC_PRICES.find(p => 
        p.category.toLowerCase() === cat.toLowerCase() &&
        p.material.toLowerCase() === mat.toLowerCase() &&
        p.unit.toLowerCase() === un.toLowerCase()
      );
    
    let staticMatch = tryMatch(normalizedCategory, material, normalizedUnit);
    if (!staticMatch) {
      // Try original category/unit
      staticMatch = tryMatch(category, material, unit);
    }
    
    if (staticMatch) {
      return (staticMatch.lowPrice + staticMatch.highPrice) / 2;
    }
    
    // Default fallback based on category (midpoints of revised Singapore 2025–2026 market rates)
    const defaults: Record<string, number> = {
      // Kitchen
      "Kitchen": 15000,
      "Kitchen Countertop": 300,   // midpoint SGD 200–400 per linear ft
      "Kitchen Cabinetry": 140,    // midpoint SGD 100–180 per linear ft
      "Kitchen Sink & Tap": 700,
      "Kitchen Hob & Hood": 2000,
      "Kitchen Appliances": 2500,
      // Bathroom
      "Bathroom": 12000,
      "Bathroom Vanity": 2000,
      "Bathroom Tiling": 15,
      "Bathroom Fixtures": 800,
      "Bathroom Shower Screen": 1200,
      // General
      "Flooring": 8,
      "Lighting": 200,
      "Carpentry": 150,           // midpoint SGD 100–200 per linear ft (plywood)
      "Electrical Points": 100,
      "Painting": 5,
      "Plumbing": 300,
      "Windows & Doors": 1500,
      "HVAC": 2500,
      "Wall Finishes": 30,
      "Built‑In Furniture": 2200,
      "Smart Home": 200,
      "Other": 1000,
    };
    
    return defaults[category] ?? 1000;
  }
  
  static async seedIfEmpty() {
    const count = await prisma.marketPrice.count();
    if (count === 0) {
      await prisma.marketPrice.createMany({
        data: STATIC_PRICES.map(p => ({
          ...p,
          updatedAt: p.updatedAt,
          createdAt: new Date(),
        })),
      });
      console.log(`Seeded ${STATIC_PRICES.length} market prices`);
    }
  }
}