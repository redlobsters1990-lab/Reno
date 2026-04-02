import { z } from "zod";
import { propertyTypes, stylePreferences } from "@/lib/constants";

export const signUpSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
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
