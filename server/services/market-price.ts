import { prisma } from "@/server/db";

export type MarketPrice = {
  category: string;
  material: string;
  unit: string;
  lowPrice: number;
  highPrice: number;
  source: string;
  updatedAt: Date;
};

const STATIC_PRICES: MarketPrice[] = [
  // Kitchen Countertop (per foot run)
  { category: "Kitchen Countertop", material: "Laminate", unit: "foot run", lowPrice: 300, highPrice: 500, source: "Renotalk 2025", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Quartz", unit: "foot run", lowPrice: 600, highPrice: 1000, source: "BCA 2024", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Marble", unit: "foot run", lowPrice: 800, highPrice: 1500, source: "BCA 2024", updatedAt: new Date() },
  { category: "Kitchen Countertop", material: "Solid Wood", unit: "foot run", lowPrice: 700, highPrice: 1200, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Kitchen Cabinetry (per linear foot)
  { category: "Kitchen Cabinetry", material: "Laminate", unit: "linear foot", lowPrice: 400, highPrice: 800, source: "Renotalk 2025", updatedAt: new Date() },
  { category: "Kitchen Cabinetry", material: "Solid Wood", unit: "linear foot", lowPrice: 800, highPrice: 1500, source: "Renotalk 2025", updatedAt: new Date() },
  { category: "Kitchen Cabinetry", material: "Plywood", unit: "linear foot", lowPrice: 300, highPrice: 600, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Kitchen Sink & Tap (per set)
  { category: "Kitchen Sink & Tap", material: "Stainless Steel", unit: "set", lowPrice: 300, highPrice: 800, source: "Qanvast 2025", updatedAt: new Date() },
  { category: "Kitchen Sink & Tap", material: "Ceramic", unit: "set", lowPrice: 500, highPrice: 1200, source: "Qanvast 2025", updatedAt: new Date() },
  
  // Kitchen Hob & Hood (per set)
  { category: "Kitchen Hob & Hood", material: "Standard", unit: "set", lowPrice: 800, highPrice: 2000, source: "Industry Average", updatedAt: new Date() },
  { category: "Kitchen Hob & Hood", material: "Premium", unit: "set", lowPrice: 2000, highPrice: 5000, source: "Industry Average", updatedAt: new Date() },
  
  // Kitchen Appliances (per piece) – optional, users usually know exact model prices
  { category: "Kitchen Appliances", material: "Oven", unit: "piece", lowPrice: 800, highPrice: 3000, source: "Estimated", updatedAt: new Date() },
  { category: "Kitchen Appliances", material: "Fridge", unit: "piece", lowPrice: 1000, highPrice: 4000, source: "Estimated", updatedAt: new Date() },
  
  // Bathroom Vanity (per unit)
  { category: "Bathroom Vanity", material: "Laminate", unit: "unit", lowPrice: 800, highPrice: 2000, source: "Renotalk 2025", updatedAt: new Date() },
  { category: "Bathroom Vanity", material: "Solid Wood", unit: "unit", lowPrice: 1500, highPrice: 4000, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Bathroom Tiling (per sq ft)
  { category: "Bathroom Tiling", material: "Ceramic Tile", unit: "sq ft", lowPrice: 6, highPrice: 12, source: "Renotalk 2025", updatedAt: new Date() },
  { category: "Bathroom Tiling", material: "Porcelain Tile", unit: "sq ft", lowPrice: 8, highPrice: 18, source: "Renotalk 2025", updatedAt: new Date() },
  { category: "Bathroom Tiling", material: "Mosaic", unit: "sq ft", lowPrice: 15, highPrice: 30, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Bathroom Fixtures (per piece)
  { category: "Bathroom Fixtures", material: "Toilet", unit: "piece", lowPrice: 300, highPrice: 1000, source: "Qanvast 2025", updatedAt: new Date() },
  { category: "Bathroom Fixtures", material: "Basin", unit: "piece", lowPrice: 200, highPrice: 800, source: "Qanvast 2025", updatedAt: new Date() },
  { category: "Bathroom Fixtures", material: "Shower Set", unit: "piece", lowPrice: 400, highPrice: 1500, source: "Qanvast 2025", updatedAt: new Date() },
  
  // Bathroom Shower Screen (per unit)
  { category: "Bathroom Shower Screen", material: "Frameless", unit: "unit", lowPrice: 800, highPrice: 2000, source: "Industry Average", updatedAt: new Date() },
  { category: "Bathroom Shower Screen", material: "Semi‑frameless", unit: "unit", lowPrice: 500, highPrice: 1200, source: "Industry Average", updatedAt: new Date() },
  
  // Flooring (per sq ft)
  { category: "Flooring", material: "Vinyl", unit: "sq ft", lowPrice: 4, highPrice: 8, source: "Qanvast 2025", updatedAt: new Date() },
  { category: "Flooring", material: "Laminate", unit: "sq ft", lowPrice: 5, highPrice: 10, source: "Qanvast 2025", updatedAt: new Date() },
  { category: "Flooring", material: "Engineered Wood", unit: "sq ft", lowPrice: 8, highPrice: 15, source: "BCA 2024", updatedAt: new Date() },
  { category: "Flooring", material: "Ceramic Tile", unit: "sq ft", lowPrice: 6, highPrice: 12, source: "Renotalk 2025", updatedAt: new Date() },
  { category: "Flooring", material: "Porcelain Tile", unit: "sq ft", lowPrice: 8, highPrice: 18, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Lighting (per piece)
  { category: "Lighting", material: "LED", unit: "piece", lowPrice: 100, highPrice: 400, source: "Qanvast 2025", updatedAt: new Date() },
  { category: "Lighting", material: "Downlight", unit: "piece", lowPrice: 50, highPrice: 150, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Carpentry (per linear foot)
  { category: "Carpentry", material: "Plywood", unit: "linear foot", lowPrice: 200, highPrice: 400, source: "Renotalk 2025", updatedAt: new Date() },
  { category: "Carpentry", material: "Solid Wood", unit: "linear foot", lowPrice: 400, highPrice: 800, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Electrical Points (per piece)
  { category: "Electrical Points", material: "Power Point", unit: "piece", lowPrice: 80, highPrice: 150, source: "BCA 2024", updatedAt: new Date() },
  { category: "Electrical Points", material: "Lighting Point", unit: "piece", lowPrice: 60, highPrice: 120, source: "BCA 2024", updatedAt: new Date() },
  
  // Painting (per sq ft)
  { category: "Painting", material: "Paint", unit: "sq ft", lowPrice: 2, highPrice: 4, source: "BCA 2024", updatedAt: new Date() },
  { category: "Painting", material: "Wallpaper", unit: "sq ft", lowPrice: 5, highPrice: 12, source: "Qanvast 2025", updatedAt: new Date() },
  
  // Plumbing (per point)
  { category: "Plumbing", material: "Water Point", unit: "piece", lowPrice: 150, highPrice: 300, source: "BCA 2024", updatedAt: new Date() },
  { category: "Plumbing", material: "Sanitary Point", unit: "piece", lowPrice: 200, highPrice: 500, source: "BCA 2024", updatedAt: new Date() },
  
  // Windows & Doors (per piece)
  { category: "Windows & Doors", material: "Window", unit: "piece", lowPrice: 800, highPrice: 2500, source: "Industry Average", updatedAt: new Date() },
  { category: "Windows & Doors", material: "Door", unit: "piece", lowPrice: 500, highPrice: 2000, source: "Industry Average", updatedAt: new Date() },
  
  // HVAC (per unit)
  { category: "HVAC", material: "Air‑Con Unit", unit: "piece", lowPrice: 2000, highPrice: 5000, source: "Estimated", updatedAt: new Date() },
  { category: "HVAC", material: "Fan Coil", unit: "piece", lowPrice: 800, highPrice: 2000, source: "Estimated", updatedAt: new Date() },
  
  // Wall Finishes (per sq ft)
  { category: "Wall Finishes", material: "Feature Wall", unit: "sq ft", lowPrice: 20, highPrice: 50, source: "Industry Average", updatedAt: new Date() },
  { category: "Wall Finishes", material: "Cladding", unit: "sq ft", lowPrice: 15, highPrice: 40, source: "Industry Average", updatedAt: new Date() },
  
  // Built‑In Furniture (per unit)
  { category: "Built‑In Furniture", material: "Wardrobe", unit: "unit", lowPrice: 1500, highPrice: 4000, source: "Renotalk 2025", updatedAt: new Date() },
  { category: "Built‑In Furniture", material: "TV Console", unit: "unit", lowPrice: 800, highPrice: 2500, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Smart Home (per point)
  { category: "Smart Home", material: "Smart Switch", unit: "piece", lowPrice: 100, highPrice: 300, source: "Estimated", updatedAt: new Date() },
  { category: "Smart Home", material: "Sensor", unit: "piece", lowPrice: 80, highPrice: 200, source: "Estimated", updatedAt: new Date() },
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
      "linear foot": "foot run",
      "lm": "linear meter",
      "m": "linear meter",
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
    
    // Default fallback based on category
    const defaults: Record<string, number> = {
      // Kitchen
      "Kitchen": 15000,
      "Kitchen Countertop": 8000,
      "Kitchen Cabinetry": 12000,
      "Kitchen Sink & Tap": 600,
      "Kitchen Hob & Hood": 1500,
      "Kitchen Appliances": 2500,
      // Bathroom
      "Bathroom": 12000,
      "Bathroom Vanity": 2000,
      "Bathroom Tiling": 12,
      "Bathroom Fixtures": 800,
      "Bathroom Shower Screen": 1200,
      // General
      "Flooring": 8,
      "Lighting": 200,
      "Carpentry": 300,
      "Electrical Points": 100,
      "Painting": 3,
      "Plumbing": 5000,
      "Windows & Doors": 2000,
      "HVAC": 8000,
      "Wall Finishes": 5,
      "Built‑In Furniture": 5000,
      "Smart Home": 3000,
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