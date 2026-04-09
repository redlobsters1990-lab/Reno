import { z } from "zod";
import { propertyTypes, stylePreferences, estimateCategories, materialOptions, unitOptions, heightOptions } from "@/lib/constants";

export const signUpSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be less than 80 characters")
    .regex(/^[a-zA-Z\s\-'.]+$/, "Name contains invalid characters"),
  email: z.string()
    .email("Please enter a valid email address")
    .transform((val) => val.toLowerCase().trim())
    .refine((val) => {
      // Reject disposable email domains
      const disposableDomains = [
        'tempmail.com', 'mailinator.com', 'guerrillamail.com',
        '10minutemail.com', 'throwawaymail.com', 'yopmail.com'
      ];
      const domain = val.split('@')[1];
      return !disposableDomains.includes(domain);
    }, "Disposable email addresses are not allowed"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const signInSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .transform((val) => val.toLowerCase().trim()),
  password: z.string()
    .min(1, "Password is required")
    .max(100, "Password must be less than 100 characters"),
});

export const createProjectSchema = z.object({
  title: z.string().min(2).max(120),
  propertyType: z.enum(propertyTypes),
  roomCount: z.coerce.number().int().min(0).max(20).optional().nullable(),
  budget: z.coerce.number().min(0).max(5000000).optional().nullable(),
  stylePreference: z.enum(stylePreferences).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const chatMessageSchema = z.object({
  projectId: z.string().cuid(),
  message: z.string().min(1).max(5000),
});

export const estimateInputSchema = z.object({
  propertyType: z.string().min(1),
  styleTier: z.enum(["budget", "standard", "premium"]),
  kitchenRedo: z.boolean(),
  bathroomCount: z.coerce.number().int().min(0).max(10),
  carpentryLevel: z.enum(["low", "medium", "high"]),
  electricalScope: z.enum(["basic", "moderate", "full"]),
  painting: z.boolean(),
  budget: z.coerce.number().min(0).optional().nullable(),
});

export const memoryCandidateSchema = z.object({
  message: z.string(),
  assistantReply: z.string().optional(),
  projectId: z.string().cuid(),
  userId: z.string().cuid(),
});

export const quoteCreateSchema = z.object({
  projectId: z.string().cuid(),
  contractorName: z.string().min(1).max(200),
  totalAmount: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const estimateComponentSchema = z.object({
  category: z.enum(estimateCategories),
  material: z.enum(materialOptions),
  quantity: z.coerce.number().positive(),
  unit: z.enum(unitOptions),
  unitCost: z.coerce.number().min(0).optional(),
  height: z.enum(heightOptions).optional().default("full"),
  notes: z.string().max(500).optional().nullable(),
});

export const enhancedEstimateInputSchema = z.object({
  propertyType: z.string().min(1),
  styleTier: z.enum(["budget", "standard", "premium"]),
  kitchenRedo: z.boolean().optional().default(false),
  bathroomCount: z.coerce.number().int().min(0).max(10).optional().default(0),
  carpentryLevel: z.enum(["low", "medium", "high"]).optional().default("low"),
  electricalScope: z.enum(["basic", "moderate", "full"]).optional().default("basic"),
  painting: z.boolean().optional().default(false),
  budget: z.coerce.number().min(0).optional().nullable().default(null),
  components: z.array(estimateComponentSchema).optional().default([]),
  rooms: z.array(z.object({
    name: z.string(),
    components: z.array(estimateComponentSchema),
  })).optional().default([]),
});

export const naturalLanguageEstimateRequestSchema = z.object({
  projectId: z.string().cuid(),
  description: z.string().min(10).max(5000),
});

