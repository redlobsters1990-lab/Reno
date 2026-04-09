import { prisma } from "@/server/db";
import { estimateInputSchema, enhancedEstimateInputSchema } from "@/lib/schemas";
import { MarketPriceService } from "./market-price";
import type { EstimateConfidence, HeightOption } from "@prisma/client";

interface EstimateRule {
  propertyType: string;
  styleTier: "budget" | "standard" | "premium";
  basePerSqm: number;
  kitchenMultiplier: number;
  bathroomPerUnit: number;
  carpentryMultipliers: { low: number; medium: number; high: number };
  electricalMultipliers: { basic: number; moderate: number; full: number };
  paintingMultiplier: number;
}

const RULES: EstimateRule[] = [
  {
    propertyType: "HDB BTO",
    styleTier: "budget",
    basePerSqm: 450,
    kitchenMultiplier: 1.2,
    bathroomPerUnit: 8000,
    carpentryMultipliers: { low: 1.0, medium: 1.3, high: 1.8 },
    electricalMultipliers: { basic: 1.0, moderate: 1.2, full: 1.5 },
    paintingMultiplier: 1.0,
  },
  {
    propertyType: "HDB BTO",
    styleTier: "standard",
    basePerSqm: 650,
    kitchenMultiplier: 1.5,
    bathroomPerUnit: 12000,
    carpentryMultipliers: { low: 1.2, medium: 1.6, high: 2.2 },
    electricalMultipliers: { basic: 1.1, moderate: 1.4, full: 1.8 },
    paintingMultiplier: 1.2,
  },
  {
    propertyType: "HDB BTO",
    styleTier: "premium",
    basePerSqm: 900,
    kitchenMultiplier: 2.0,
    bathroomPerUnit: 18000,
    carpentryMultipliers: { low: 1.5, medium: 2.0, high: 3.0 },
    electricalMultipliers: { basic: 1.3, moderate: 1.7, full: 2.2 },
    paintingMultiplier: 1.5,
  },
  // HDB Resale - higher base cost for hacking, rewiring, waterproofing
  {
    propertyType: "HDB Resale",
    styleTier: "budget",
    basePerSqm: 540,  // +20% vs HDB BTO budget for hacking premium
    kitchenMultiplier: 1.4,
    bathroomPerUnit: 10000,
    carpentryMultipliers: { low: 1.1, medium: 1.5, high: 2.0 },
    electricalMultipliers: { basic: 1.1, moderate: 1.5, full: 2.0 },
    paintingMultiplier: 1.1,
  },
  {
    propertyType: "HDB Resale",
    styleTier: "standard",
    basePerSqm: 780,  // +20% vs HDB BTO standard
    kitchenMultiplier: 1.8,
    bathroomPerUnit: 14000,
    carpentryMultipliers: { low: 1.4, medium: 1.9, high: 2.5 },
    electricalMultipliers: { basic: 1.3, moderate: 1.7, full: 2.2 },
    paintingMultiplier: 1.4,
  },
  {
    propertyType: "HDB Resale",
    styleTier: "premium",
    basePerSqm: 1080, // +20% vs HDB BTO premium
    kitchenMultiplier: 2.4,
    bathroomPerUnit: 22000,
    carpentryMultipliers: { low: 1.7, medium: 2.3, high: 3.3 },
    electricalMultipliers: { basic: 1.5, moderate: 2.0, full: 2.6 },
    paintingMultiplier: 1.7,
  },
  {
    propertyType: "Condo",
    styleTier: "standard",
    basePerSqm: 800,
    kitchenMultiplier: 1.8,
    bathroomPerUnit: 15000,
    carpentryMultipliers: { low: 1.3, medium: 1.8, high: 2.5 },
    electricalMultipliers: { basic: 1.2, moderate: 1.6, full: 2.0 },
    paintingMultiplier: 1.3,
  },
  {
    propertyType: "Landed",
    styleTier: "standard",
    basePerSqm: 700,
    kitchenMultiplier: 2.2,
    bathroomPerUnit: 20000,
    carpentryMultipliers: { low: 1.4, medium: 2.0, high: 3.0 },
    electricalMultipliers: { basic: 1.4, moderate: 1.9, full: 2.5 },
    paintingMultiplier: 1.4,
  },
];

const DEFAULT_AREA_SQM = 90;

function findRule(propertyType: string, styleTier: "budget" | "standard" | "premium"): EstimateRule {
  const rule = RULES.find(
    (r) => r.propertyType === propertyType && r.styleTier === styleTier,
  );
  
  if (!rule) {
    // Fallback to first HDB BTO budget rule
    return RULES[0];
  }
  
  return rule;
}

export class EstimateService {
  static async createEstimate(
    userId: string,
    projectId: string,
    data: unknown,
  ) {
    const validated = estimateInputSchema.parse(data);
    
    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    const rule = findRule(validated.propertyType, validated.styleTier);
    
    // Calculate base cost
    let baseCost = rule.basePerSqm * DEFAULT_AREA_SQM;
    
    // Apply multipliers
    if (validated.kitchenRedo) {
      baseCost *= rule.kitchenMultiplier;
    }
    
    baseCost += validated.bathroomCount * rule.bathroomPerUnit;
    baseCost *= rule.carpentryMultipliers[validated.carpentryLevel];
    baseCost *= rule.electricalMultipliers[validated.electricalScope];
    
    if (validated.painting) {
      baseCost *= rule.paintingMultiplier;
    }
    
    // Apply budget constraint if provided
    if (validated.budget && baseCost > validated.budget) {
      baseCost = validated.budget * 0.9; // Adjust down but keep realistic
    }
    
    // Calculate ranges
    const leanMin = baseCost * 0.7;
    const leanMax = baseCost * 0.9;
    const realisticMin = baseCost * 0.9;
    const realisticMax = baseCost * 1.2;
    const stretchMin = baseCost * 1.2;
    const stretchMax = baseCost * 1.5;
    
    // Determine confidence
    let confidence: EstimateConfidence = "medium";
    if (validated.budget) {
      confidence = "high";
    } else if (validated.propertyType === "HDB BTO" || validated.propertyType === "Condo") {
      confidence = "medium";
    } else {
      confidence = "low";
    }
    
    // Build assumptions and cost drivers
    const assumptions = [
      `Property type: ${validated.propertyType}`,
      `Style tier: ${validated.styleTier}`,
      `Kitchen redo: ${validated.kitchenRedo ? "Yes" : "No"}`,
      `Bathrooms: ${validated.bathroomCount}`,
      `Carpentry level: ${validated.carpentryLevel}`,
      `Electrical scope: ${validated.electricalScope}`,
      `Painting: ${validated.painting ? "Yes" : "No"}`,
      `Assumed area: ${DEFAULT_AREA_SQM} sqm`,
    ].join("\n");
    
    const costDrivers = [
      validated.kitchenRedo ? "Kitchen renovation" : null,
      validated.bathroomCount > 0 ? `${validated.bathroomCount} bathroom(s)` : null,
      validated.carpentryLevel !== "low" ? "Custom carpentry" : null,
      validated.electricalScope !== "basic" ? "Electrical upgrades" : null,
      validated.painting ? "Painting" : null,
    ].filter(Boolean).join(", ");
    
    const estimate = await prisma.costEstimate.create({
      data: {
        projectId,
        userId,
        leanMin,
        leanMax,
        realisticMin,
        realisticMax,
        stretchMin,
        stretchMax,
        confidence,
        assumptions,
        costDrivers,
        estimatorInputs: JSON.stringify(validated),
      },
    });
    
    return estimate;
  }
  
  static async listEstimates(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    const estimates = await prisma.costEstimate.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: { components: true },
    });
    
    return estimates;
  }

  static async createEnhancedEstimate(
    userId: string,
    projectId: string,
    data: unknown,
  ) {
    const validated = enhancedEstimateInputSchema.parse(data);
    console.log('Enhanced estimate input:', validated);
    
    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Calculate base cost from components if provided, otherwise fallback to rule-based
    let baseCost = 0;
    let enrichedComponents: Array<{category: string; material: string; quantity: number; unit: string; unitCost: number; total: number; notes?: string; height?: string}> = [];
    if (validated.components && validated.components.length > 0) {
      console.log('Processing', validated.components.length, 'components');
      // Enrich each component with unitCost (looked up if needed) and total
      for (const comp of validated.components) {
        console.log('Component:', comp);
        let unitCost = comp.unitCost;
        if (!unitCost) {
          try {
            unitCost = await this.lookupMarketPrice(comp.category, comp.material, comp.unit);
            console.log('Looked up unit cost:', unitCost, 'for', comp.category, comp.material, comp.unit);
          } catch (lookupError) {
            console.error('Market price lookup failed:', lookupError);
            // Fallback to a safe default (e.g., 0) to avoid breaking the estimate
            unitCost = 0;
          }
        }
        const total = unitCost * comp.quantity;
        enrichedComponents.push({
          category: comp.category,
          material: comp.material,
          quantity: comp.quantity,
          unit: comp.unit,
          unitCost,
          total,
          height: comp.height,
          notes: comp.notes,
        });
        baseCost += total;
      }
      // Add contingency (20%) for labor, overhead, etc.
      baseCost *= 1.2;
    } else {
      // Fallback to original rule-based calculation
      const rule = findRule(validated.propertyType, validated.styleTier);
      baseCost = rule.basePerSqm * DEFAULT_AREA_SQM;
      
      let adjustments = 0;
      
      if (validated.kitchenRedo) {
        // Kitchen redo adds percentage of base cost
        adjustments += baseCost * (rule.kitchenMultiplier - 1);
      }
      
      // Bathrooms add fixed amount per unit
      adjustments += validated.bathroomCount * rule.bathroomPerUnit;
      
      // Carpentry: assume 30% of base cost is carpentry-related
      const carpentryBase = baseCost * 0.3;
      adjustments += carpentryBase * (rule.carpentryMultipliers[validated.carpentryLevel] - 1);
      
      // Electrical: assume 10% of base cost is electrical
      const electricalBase = baseCost * 0.1;
      adjustments += electricalBase * (rule.electricalMultipliers[validated.electricalScope] - 1);
      
      if (validated.painting) {
        // Painting: assume 15% of base cost is painting
        const paintingBase = baseCost * 0.15;
        adjustments += paintingBase * (rule.paintingMultiplier - 1);
      }
      
      baseCost += adjustments;
      
      if (validated.budget && baseCost > validated.budget) {
        baseCost = validated.budget * 0.9;
      }
    }
    
    // Calculate ranges (same as before)
    const leanMin = baseCost * 0.7;
    const leanMax = baseCost * 0.9;
    const realisticMin = baseCost * 0.9;
    const realisticMax = baseCost * 1.2;
    const stretchMin = baseCost * 1.2;
    const stretchMax = baseCost * 1.5;
    
    // Determine confidence
    let confidence: EstimateConfidence = "medium";
    if (validated.components && validated.components.length >= 5) {
      confidence = "high";
    } else if (validated.budget) {
      confidence = "high";
    } else if (validated.propertyType === "HDB BTO" || validated.propertyType === "Condo") {
      confidence = "medium";
    } else {
      confidence = "low";
    }
    
    // Build assumptions
    const assumptions = [
      `Property type: ${validated.propertyType}`,
      `Style tier: ${validated.styleTier}`,
      validated.components && validated.components.length > 0 
        ? `Detailed components: ${validated.components.length} items`
        : `Kitchen redo: ${validated.kitchenRedo ? "Yes" : "No"}`,
      validated.components && validated.components.length > 0
        ? ""
        : `Bathrooms: ${validated.bathroomCount}`,
    ].filter(line => line.trim().length > 0).join("\n");
    
    const costDrivers = validated.components && validated.components.length > 0
      ? validated.components.map(c => `${c.category} (${c.material})`).slice(0, 3).join(", ") + (validated.components.length > 3 ? "..." : "")
      : [
          validated.kitchenRedo ? "Kitchen renovation" : null,
          validated.bathroomCount > 0 ? `${validated.bathroomCount} bathroom(s)` : null,
          validated.carpentryLevel !== "low" ? "Custom carpentry" : null,
          validated.electricalScope !== "basic" ? "Electrical upgrades" : null,
          validated.painting ? "Painting" : null,
        ].filter(Boolean).join(", ");
    
    // Create the estimate record
    const estimate = await prisma.costEstimate.create({
      data: {
        projectId,
        userId,
        leanMin,
        leanMax,
        realisticMin,
        realisticMax,
        stretchMin,
        stretchMax,
        confidence,
        assumptions,
        costDrivers,
        estimatorInputs: JSON.stringify(validated),
      },
    });
    
    // Create component records if provided
    if (enrichedComponents.length > 0) {
      const componentData = enrichedComponents.map(comp => ({
        estimateId: estimate.id,
        userId,
        projectId,
        category: comp.category,
        material: comp.material,
        quantity: comp.quantity,
        unit: comp.unit,
        unitCost: comp.unitCost,
        totalCost: comp.total,
        height: comp.height || null,
        notes: comp.notes || null,
      }));
      
      console.log("Creating component data:", componentData);
      
      await prisma.estimateComponent.createMany({
        data: componentData,
      });
    }
    
    // Return estimate with components if needed
    const estimateWithComponents = await prisma.costEstimate.findUnique({
      where: { id: estimate.id },
      include: { components: true },
    });
    
    return estimateWithComponents!;
  }
  
  static async lookupMarketPrice(category: string, material: string, unit: string): Promise<number> {
    return MarketPriceService.lookup(category, material, unit);
  }
}
