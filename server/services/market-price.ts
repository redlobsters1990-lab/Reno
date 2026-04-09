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
  // Kitchen
  { category: "Kitchen", material: "Laminate", unit: "linear foot", lowPrice: 300, highPrice: 500, source: "Renotalk 2025", updatedAt: new Date() },
  { category: "Kitchen", material: "Quartz", unit: "linear foot", lowPrice: 600, highPrice: 1000, source: "BCA 2024", updatedAt: new Date() },
  { category: "Kitchen", material: "Marble", unit: "linear foot", lowPrice: 800, highPrice: 1500, source: "BCA 2024", updatedAt: new Date() },
  { category: "Kitchen", material: "Solid Wood", unit: "linear foot", lowPrice: 700, highPrice: 1200, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Flooring (per sqft)
  { category: "Flooring", material: "Vinyl", unit: "sqft", lowPrice: 4, highPrice: 8, source: "Qanvast 2025", updatedAt: new Date() },
  { category: "Flooring", material: "Laminate", unit: "sqft", lowPrice: 5, highPrice: 10, source: "Qanvast 2025", updatedAt: new Date() },
  { category: "Flooring", material: "Engineered Wood", unit: "sqft", lowPrice: 8, highPrice: 15, source: "BCA 2024", updatedAt: new Date() },
  { category: "Flooring", material: "Ceramic Tile", unit: "sqft", lowPrice: 6, highPrice: 12, source: "Renotalk 2025", updatedAt: new Date() },
  { category: "Flooring", material: "Porcelain Tile", unit: "sqft", lowPrice: 8, highPrice: 18, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Bathroom (per unit)
  { category: "Bathroom", material: "Ceramic Tile", unit: "unit", lowPrice: 8000, highPrice: 15000, source: "BCA 2024", updatedAt: new Date() },
  { category: "Bathroom", material: "Porcelain Tile", unit: "unit", lowPrice: 10000, highPrice: 20000, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Lighting (per piece)
  { category: "Lighting", material: "LED", unit: "piece", lowPrice: 100, highPrice: 400, source: "Qanvast 2025", updatedAt: new Date() },
  { category: "Lighting", material: "Downlight", unit: "piece", lowPrice: 50, highPrice: 150, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Painting (per sqft)
  { category: "Painting", material: "Paint", unit: "sqft", lowPrice: 2, highPrice: 4, source: "BCA 2024", updatedAt: new Date() },
  { category: "Painting", material: "Wallpaper", unit: "sqft", lowPrice: 5, highPrice: 12, source: "Qanvast 2025", updatedAt: new Date() },
  
  // Carpentry (per linear foot)
  { category: "Carpentry", material: "Plywood", unit: "linear foot", lowPrice: 200, highPrice: 400, source: "Renotalk 2025", updatedAt: new Date() },
  { category: "Carpentry", material: "Solid Wood", unit: "linear foot", lowPrice: 400, highPrice: 800, source: "Renotalk 2025", updatedAt: new Date() },
  
  // Electrical (per point)
  { category: "Electrical", material: "Power Point", unit: "piece", lowPrice: 80, highPrice: 150, source: "BCA 2024", updatedAt: new Date() },
  { category: "Electrical", material: "Lighting Point", unit: "piece", lowPrice: 60, highPrice: 120, source: "BCA 2024", updatedAt: new Date() },
];

export class MarketPriceService {
  static async lookup(category: string, material: string, unit: string): Promise<number> {
    // Try database first
    const record = await prisma.marketPrice.findFirst({
      where: { category, material, unit },
      orderBy: { updatedAt: "desc" },
    });
    
    if (record) {
      // Return average of low and high
      return (record.lowPrice + record.highPrice) / 2;
    }
    
    // Fallback to static data
    const staticMatch = STATIC_PRICES.find(p => 
      p.category.toLowerCase() === category.toLowerCase() &&
      p.material.toLowerCase() === material.toLowerCase() &&
      p.unit.toLowerCase() === unit.toLowerCase()
    );
    
    if (staticMatch) {
      return (staticMatch.lowPrice + staticMatch.highPrice) / 2;
    }
    
    // Default fallback based on category
    const defaults: Record<string, number> = {
      "Kitchen": 15000,
      "Bathroom": 12000,
      "Flooring": 8,
      "Lighting": 200,
      "Carpentry": 300,
      "Electrical": 100,
      "Painting": 3,
      "Plumbing": 5000,
      "Windows & Doors": 2000,
      "HVAC": 8000,
      "Tiling": 10,
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