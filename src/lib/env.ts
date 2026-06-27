// Environment validation — fail fast with clear errors if required env vars are missing

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Optional: Add Sentry for error tracking when ready
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  // Optional: Add analytics when ready
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
});

/**
 * Validate environment variables and return typed config
 * Call this at module load time to fail fast on missing vars
 */
export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues.map((e) => e.path.join(".")).join(", ");
      throw new Error(
        `Missing or invalid environment variables: ${missing}\n` +
        `Please add these to your .env file. See .env.example for reference.`
      );
    }
    throw error;
  }
}

/**
 * Get validated environment (cached after first call)
 */
let cachedEnv: ReturnType<typeof validateEnv> | null = null;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Type-safe env access
 */
export const env = {
  get databaseUrl() {
    return getEnv().DATABASE_URL;
  },
  get nodeEnv() {
    return getEnv().NODE_ENV;
  },
  get isProduction() {
    return getEnv().NODE_ENV === "production";
  },
  get isDevelopment() {
    return getEnv().NODE_ENV === "development";
  },
  get isTest() {
    return getEnv().NODE_ENV === "test";
  },
  get sentryDsn() {
    return getEnv().NEXT_PUBLIC_SENTRY_DSN;
  },
  get analyticsId() {
    return getEnv().NEXT_PUBLIC_ANALYTICS_ID;
  },
};