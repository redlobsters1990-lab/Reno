import { prisma } from "@/server/db";
import { estimateInputSchema } from "@/lib/schemas";
import type { EstimateConfidence } from "@prisma/client";

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
    });
    
    return estimates;
  }
}
