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
  // ===== KITCHEN =====
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
  // Sources: Qanvast 2025 + local retail price checks (Ikea, HomeFix, Mega Discount Store)
  { category: "Kitchen Sink & Tap", material: "Stainless Steel", unit: "set", lowPrice: 250, highPrice: 600, source: "Qanvast 2025 + local retail (basic to mid-range stainless steel sink + tap)", updatedAt: new Date() },
  { category: "Kitchen Sink & Tap", material: "Ceramic", unit: "set", lowPrice: 400, highPrice: 900, source: "Qanvast 2025 + local retail (ceramic sink with mixer)", updatedAt: new Date() },
  { category: "Kitchen Sink & Tap", material: "Composite", unit: "set", lowPrice: 350, highPrice: 800, source: "Industry Average (composite granite sink)", updatedAt: new Date() },
  
  // Kitchen Hob & Hood (per set)
  // Sources: Industry research + Singapore appliance retail (Courts, Harvey Norman, Best Denki)
  { category: "Kitchen Hob & Hood", material: "Standard", unit: "set", lowPrice: 600, highPrice: 1500, source: "Industry Average (basic 2-burner gas hob + hood, Singapore retail)", updatedAt: new Date() },
  { category: "Kitchen Hob & Hood", material: "Induction", unit: "set", lowPrice: 1200, highPrice: 3000, source: "Industry Average (induction hob + chimney hood)", updatedAt: new Date() },
  { category: "Kitchen Hob & Hood", material: "Premium", unit: "set", lowPrice: 2500, highPrice: 6000, source: "Industry Average (high-end European brand, built-in extraction)", updatedAt: new Date() },
  
  // Kitchen Appliances (per piece) – optional
  { category: "Kitchen Appliances", material: "Oven", unit: "piece", lowPrice: 500, highPrice: 2000, source: "Estimated (built-in oven, Singapore retail)", updatedAt: new Date() },
  { category: "Kitchen Appliances", material: "Fridge", unit: "piece", lowPrice: 800, highPrice: 3000, source: "Estimated (refrigerator, Singapore retail)", updatedAt: new Date() },
  { category: "Kitchen Appliances", material: "Dishwasher", unit: "piece", lowPrice: 600, highPrice: 2000, source: "Industry Average (built-in dishwasher)", updatedAt: new Date() },
  
  // ===== BATHROOM =====
  // Bathroom Vanity (per unit) - includes countertop and cabinet
  // Sources: Renotalk 2025 + Design Authority 2026
  { category: "Bathroom Vanity", material: "Laminate", unit: "unit", lowPrice: 600, highPrice: 1500, source: "Renotalk 2025 (basic laminate vanity 600–800mm width)", updatedAt: new Date() },
  { category: "Bathroom Vanity", material: "Solid Wood", unit: "unit", lowPrice: 1200, highPrice: 3000, source: "Renotalk 2025 (solid wood vanity, custom size)", updatedAt: new Date() },
  { category: "Bathroom Vanity", material: "Acrylic", unit: "unit", lowPrice: 800, highPrice: 2000, source: "Industry Average (acrylic finish vanity)", updatedAt: new Date() },
  
  // Bathroom Tiling (per sq ft)
  // Sources: Renotalk 2025, Design Authority 2026
  { category: "Bathroom Tiling", material: "Ceramic Tile", unit: "sq ft", lowPrice: 5, highPrice: 10, source: "Renotalk 2025 (ceramic wall/floor tiles, SGD 5–10 per sq ft)", updatedAt: new Date() },
  { category: "Bathroom Tiling", material: "Porcelain Tile", unit: "sq ft", lowPrice: 7, highPrice: 15, source: "Renotalk 2025 (porcelain tiles, SGD 7–15 per sq ft)", updatedAt: new Date() },
  { category: "Bathroom Tiling", material: "Mosaic", unit: "sq ft", lowPrice: 12, highPrice: 25, source: "Renotalk 2025 (mosaic feature tiles, SGD 12–25 per sq ft)", updatedAt: new Date() },
  
  // Bathroom Fixtures (per piece)
  // Sources: Qanvast 2025, BCA 2024
  { category: "Bathroom Fixtures", material: "Toilet", unit: "piece", lowPrice: 250, highPrice: 800, source: "Qanvast 2025 (basic to water-saving toilet)", updatedAt: new Date() },
  { category: "Bathroom Fixtures", material: "Basin", unit: "piece", lowPrice: 150, highPrice: 600, source: "Qanvast 2025 (countertop or wall-hung basin)", updatedAt: new Date() },
  { category: "Bathroom Fixtures", material: "Shower Set", unit: "piece", lowPrice: 300, highPrice: 1200, source: "Qanvast 2025 (rain shower + mixer)", updatedAt: new Date() },
  { category: "Bathroom Fixtures", material: "Bidet", unit: "piece", lowPrice: 200, highPrice: 700, source: "Industry Average (electronic bidet seat)", updatedAt: new Date() },
  
  // Bathroom Shower Screen (per unit)
  { category: "Bathroom Shower Screen", material: "Frameless", unit: "unit", lowPrice: 600, highPrice: 1500, source: "Industry Average (frameless glass shower screen)", updatedAt: new Date() },
  { category: "Bathroom Shower Screen", material: "Semi‑frameless", unit: "unit", lowPrice: 400, highPrice: 1000, source: "Industry Average (semi-frameless shower screen)", updatedAt: new Date() },
  
  // ===== FLOORING =====
  // Flooring (per sq ft)
  // Sources: Qanvast 2025, BCA 2024, Design Authority 2026
  { category: "Flooring", material: "Vinyl", unit: "sq ft", lowPrice: 3, highPrice: 7, source: "Qanvast 2025 (vinyl plank/ sheet, SGD 3–7 per sq ft)", updatedAt: new Date() },
  { category: "Flooring", material: "Laminate", unit: "sq ft", lowPrice: 4, highPrice: 9, source: "Qanvast 2025 (laminate flooring, SGD 4–9 per sq ft)", updatedAt: new Date() },
  { category: "Flooring", material: "Engineered Wood", unit: "sq ft", lowPrice: 6, highPrice: 12, source: "BCA 2024 (engineered wood flooring, SGD 6–12 per sq ft)", updatedAt: new Date() },
  { category: "Flooring", material: "Ceramic Tile", unit: "sq ft", lowPrice: 5, highPrice: 10, source: "Renotalk 2025 (ceramic floor tiles)", updatedAt: new Date() },
  { category: "Flooring", material: "Porcelain Tile", unit: "sq ft", lowPrice: 7, highPrice: 15, source: "Renotalk 2025 (porcelain floor tiles)", updatedAt: new Date() },
  { category: "Flooring", material: "Marble", unit: "sq ft", lowPrice: 15, highPrice: 30, source: "Industry Average (marble flooring)", updatedAt: new Date() },
  
  // ===== LIGHTING =====
  // Lighting (per piece)
  // Sources: Qanvast 2025, Renotalk 2025
  { category: "Lighting", material: "LED", unit: "piece", lowPrice: 80, highPrice: 300, source: "Qanvast 2025 (LED pendant/ceiling light)", updatedAt: new Date() },
  { category: "Lighting", material: "Downlight", unit: "piece", lowPrice: 40, highPrice: 120, source: "Renotalk 2025 (recessed downlight)", updatedAt: new Date() },
  { category: "Lighting", material: "Track Light", unit: "piece", lowPrice: 60, highPrice: 200, source: "Industry Average (track lighting)", updatedAt: new Date() },
  
  // ===== CARPENTRY =====
  // Carpentry (per linear ft) - built-in wardrobes, TV consoles, etc.
  // Height: full-height assumed (floor-to-ceiling). Half-height ~60-70% of price.
  // Sources: Design Authority 2026, Renotalk 2025
  { category: "Carpentry", material: "Plywood", unit: "ft", height: "full", lowPrice: 80, highPrice: 160, source: "Design Authority 2026 (plywood built-in carpentry, SGD 80–160 per linear ft)", updatedAt: new Date() },
  { category: "Carpentry", material: "Solid Wood", unit: "ft", height: "full", lowPrice: 150, highPrice: 300, source: "Design Authority 2026 (solid wood built-in, SGD 150–300 per linear ft)", updatedAt: new Date() },
  { category: "Carpentry", material: "Engineered Wood", unit: "ft", height: "full", lowPrice: 100, highPrice: 200, source: "Industry Average (engineered wood carpentry)", updatedAt: new Date() },
  { category: "Carpentry", material: "Melamine", unit: "ft", height: "full", lowPrice: 70, highPrice: 140, source: "Industry Average (melamine finish)", updatedAt: new Date() },
  { category: "Carpentry", material: "MDF", unit: "ft", height: "full", lowPrice: 60, highPrice: 130, source: "Industry Average (MDF built-in)", updatedAt: new Date() },
  
  // ===== ELECTRICAL =====
  // Electrical Points (per piece)
  // Sources: BCA 2024, fixfirst.sg ($80–150 per power point)
  { category: "Electrical Points", material: "Power Point", unit: "piece", lowPrice: 80, highPrice: 150, source: "fixfirst.sg 2026 (13A power point, SGD 80–150)", updatedAt: new Date() },
  { category: "Electrical Points", material: "Lighting Point", unit: "piece", lowPrice: 50, highPrice: 100, source: "BCA 2024 (lighting point)", updatedAt: new Date() },
  { category: "Electrical Points", material: "Water Heater Point", unit: "piece", lowPrice: 120, highPrice: 200, source: "fixfirst.sg 2026 (water heater with isolator)", updatedAt: new Date() },
  
  // ===== PAINTING =====
  // Painting (per sq ft)
  // Sources: BCA 2024, Design Authority 2026
  { category: "Painting", material: "Paint", unit: "sq ft", lowPrice: 1.5, highPrice: 3, source: "BCA 2024 (emulsion paint, 2 coats, SGD 1.5–3 per sq ft)", updatedAt: new Date() },
  { category: "Painting", material: "Wallpaper", unit: "sq ft", lowPrice: 4, highPrice: 10, source: "Qanvast 2025 (wallpaper installation, SGD 4–10 per sq ft)", updatedAt: new Date() },
  
  // ===== PLUMBING =====
  // Plumbing (per point)
  // Sources: BCA 2024, directplumber.sg
  { category: "Plumbing", material: "Water Point", unit: "piece", lowPrice: 120, highPrice: 250, source: "BCA 2024 (cold/hot water point installation)", updatedAt: new Date() },
  { category: "Plumbing", material: "Sanitary Point", unit: "piece", lowPrice: 150, highPrice: 350, source: "BCA 2024 (sanitary plumbing point)", updatedAt: new Date() },
  { category: "Plumbing", material: "Drain Point", unit: "piece", lowPrice: 100, highPrice: 220, source: "Industry Average (drainage point)", updatedAt: new Date() },
  
  // ===== WINDOWS & DOORS =====
  // Windows & Doors (per piece)
  { category: "Windows & Doors", material: "Window", unit: "piece", lowPrice: 600, highPrice: 2000, source: "Industry Average (aluminum window, SGD 600–2000 per piece)", updatedAt: new Date() },
  { category: "Windows & Doors", material: "Door", unit: "piece", lowPrice: 400, highPrice: 1500, source: "Industry Average (solid core door, SGD 400–1500)", updatedAt: new Date() },
  { category: "Windows & Doors", material: "Sliding Door", unit: "piece", lowPrice: 800, highPrice: 3000, source: "Industry Average (glass sliding door)", updatedAt: new Date() },
  
  // ===== HVAC =====
  // HVAC (per unit)
  { category: "HVAC", material: "Air‑Con Unit", unit: "piece", lowPrice: 1500, highPrice: 4000, source: "Estimated (system 3/4, Singapore retail)", updatedAt: new Date() },
  { category: "HVAC", material: "Fan Coil", unit: "piece", lowPrice: 600, highPrice: 1500, source: "Estimated (fan coil unit)", updatedAt: new Date() },
  { category: "HVAC", material: "Condenser", unit: "piece", lowPrice: 800, highPrice: 2000, source: "Industry Average (outdoor condenser)", updatedAt: new Date() },
  
  // ===== WALL FINISHES =====
  // Wall Finishes (per sq ft)
  { category: "Wall Finishes", material: "Feature Wall", unit: "sq ft", lowPrice: 15, highPrice: 40, source: "Industry Average (feature wall materials, SGD 15–40 per sq ft)", updatedAt: new Date() },
  { category: "Wall Finishes", material: "Cladding", unit: "sq ft", lowPrice: 12, highPrice: 30, source: "Industry Average (wall cladding)", updatedAt: new Date() },
  { category: "Wall Finishes", material: "Wall Panel", unit: "sq ft", lowPrice: 10, highPrice: 25, source: "Industry Average (3D wall panels)", updatedAt: new Date() },
  
  // ===== BUILT‑IN FURNITURE =====
  // Built‑In Furniture (per unit)
  { category: "Built‑In Furniture", material: "Wardrobe", unit: "unit", lowPrice: 1200, highPrice: 3000, source: "Renotalk 2025 (floor-to-ceiling wardrobe, SGD 1200–3000)", updatedAt: new Date() },
  { category: "Built‑In Furniture", material: "TV Console", unit: "unit", lowPrice: 600, highPrice: 2000, source: "Renotalk 2025 (built-in TV console, SGD 600–2000)", updatedAt: new Date() },
  { category: "Built‑In Furniture", material: "Shoe Cabinet", unit: "unit", lowPrice: 400, highPrice: 1200, source: "Industry Average (built-in shoe cabinet)", updatedAt: new Date() },
  
  // ===== SMART HOME =====
  // Smart Home (per point)
  { category: "Smart Home", material: "Smart Switch", unit: "piece", lowPrice: 80, highPrice: 250, source: "Estimated (smart switch installation, SGD 80–250)", updatedAt: new Date() },
  { category: "Smart Home", material: "Sensor", unit: "piece", lowPrice: 60, highPrice: 180, source: "Estimated (motion/light sensor)", updatedAt: new Date() },
  { category: "Smart Home", material: "Smart Lock", unit: "piece", lowPrice: 300, highPrice: 800, source: "Industry Average (smart door lock)", updatedAt: new Date() },
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
      "Kitchen": 20000,
      "Kitchen Countertop": 300,   // midpoint SGD 200–400 per linear ft
      "Kitchen Cabinetry": 140,    // midpoint SGD 100–180 per linear ft
      "Kitchen Sink & Tap": 425,   // midpoint SGD 250–600 (stainless steel)
      "Kitchen Hob & Hood": 1600,  // midpoint SGD 600–1500 (standard)
      "Kitchen Appliances": 1250,  // midpoint SGD 500–2000 (oven)
      // Bathroom
      "Bathroom": 8000,
      "Bathroom Vanity": 1050,     // midpoint SGD 600–1500 (laminate)
      "Bathroom Tiling": 10,       // midpoint SGD 5–15 (ceramic–porcelain)
      "Bathroom Fixtures": 525,    // midpoint SGD 250–800 (toilet)
      "Bathroom Shower Screen": 800, // midpoint SGD 600–1500 (frameless)
      // General
      "Flooring": 7,              // midpoint SGD 3–12 (vinyl–engineered wood)
      "Lighting": 140,            // midpoint SGD 80–300 (LED)
      "Carpentry": 120,           // midpoint SGD 80–160 per linear ft (plywood)
      "Electrical Points": 115,    // midpoint SGD 80–150 (power point)
      "Painting": 2.25,           // midpoint SGD 1.5–3 per sq ft
      "Plumbing": 185,            // midpoint SGD 120–250 (water point)
      "Windows & Doors": 1000,    // midpoint SGD 600–2000 (window)
      "HVAC": 2000,               // midpoint SGD 1500–4000 (air‑con unit)
      "Wall Finishes": 22.5,      // midpoint SGD 15–40 (feature wall)
      "Built‑In Furniture": 1600,  // midpoint SGD 1200–3000 (wardrobe)
      "Smart Home": 165,          // midpoint SGD 80–250 (smart switch)
      "Other": 800,
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