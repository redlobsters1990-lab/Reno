import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { naturalLanguageEstimateRequestSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const validated = naturalLanguageEstimateRequestSchema.parse(body);
    
    // TODO: Integrate with OpenClaw AI for actual parsing
    // For now, return mock extracted components based on keywords
    const description = validated.description.toLowerCase();
    const components = [];
    
    // Simple keyword matching for demo
    if (description.includes("kitchen") || description.includes("cabinet")) {
      components.push({
        category: "Kitchen" as const,
        material: description.includes("marble") ? "Marble" : description.includes("quartz") ? "Quartz" : "Laminate",
        quantity: 1,
        unit: "unit" as const,
        unitCost: 15000,
        notes: "Kitchen renovation including cabinets and countertop",
      });
    }
    
    if (description.includes("bathroom") || description.includes("toilet")) {
      components.push({
        category: "Bathroom" as const,
        material: "Ceramic Tile",
        quantity: description.includes("two") || description.includes("2") ? 2 : 1,
        unit: "unit" as const,
        unitCost: 12000,
        notes: "Bathroom renovation with tiling and fittings",
      });
    }
    
    if (description.includes("floor") || description.includes("vinyl")) {
      components.push({
        category: "Flooring" as const,
        material: description.includes("vinyl") ? "Vinyl" : "Laminate",
        quantity: 100,
        unit: "sqft" as const,
        unitCost: 8,
        notes: "Flooring installation",
      });
    }
    
    if (description.includes("paint") || description.includes("wall")) {
      components.push({
        category: "Painting" as const,
        material: "Paint",
        quantity: 800,
        unit: "sqft" as const,
        unitCost: 3,
        notes: "Wall painting",
      });
    }
    
    if (description.includes("light") || description.includes("led")) {
      components.push({
        category: "Lighting" as const,
        material: "LED",
        quantity: 10,
        unit: "piece" as const,
        unitCost: 200,
        notes: "LED lighting fixtures",
      });
    }
    
    // If no components matched, provide a generic example
    if (components.length === 0) {
      components.push({
        category: "Other" as const,
        material: "Other",
        quantity: 1,
        unit: "unit" as const,
        unitCost: 5000,
        notes: "General renovation work",
      });
    }
    
    return NextResponse.json({
      components,
      confidence: components.length > 0 ? "medium" : "low",
      warnings: components.length === 0 ? ["Could not extract specific renovation items from description. Please use the detailed wizard for accurate estimates."] : [],
    });
  } catch (error) {
    console.error("POST /api/estimates/parse error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}