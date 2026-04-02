import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().min(1),
  OPENCLAW_BASE_URL: z.string().min(1).default("http://localhost:3001"),
  OPENCLAW_API_KEY: z.string().optional(),
  FILE_STORAGE_ROOT: z.string().min(1).default("./uploads"),
  APP_URL: z.string().min(1),
});

const envResult = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  OPENCLAW_BASE_URL: process.env.OPENCLAW_BASE_URL,
  OPENCLAW_API_KEY: process.env.OPENCLAW_API_KEY,
  FILE_STORAGE_ROOT: process.env.FILE_STORAGE_ROOT,
  APP_URL: process.env.APP_URL,
});

if (!envResult.success) {
  console.error("❌ Invalid environment variables:", envResult.error.format());
  throw new Error("Invalid environment variables");
}

export const env = envResult.data;
