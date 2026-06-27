// Simple in-memory rate limiter
// For production, replace with Redis-based rate limiting (e.g., Upstash Ratelimit)

import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

// Rate limit configurations per endpoint type
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  auth: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  api: { limit: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  content: { limit: 30, windowMs: 60 * 1000 }, // 30 requests per minute
};

// In-memory store (resets on server restart — fine for demo; use Redis in production)
const store = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

/**
 * Check if a request should be rate limited
 * @param identifier - Usually IP address + endpoint path
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.api
): { allowed: boolean; remaining: number; resetAt: number; retryAfter: number } {
  cleanup();

  const now = Date.now();
  const entry = store.get(identifier);

  // No existing entry — create one
  if (!entry || entry.resetAt < now) {
    store.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt: now + config.windowMs,
      retryAfter: 0,
    };
  }

  // Entry exists and is still valid
  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
    retryAfter: 0,
  };
}

/**
 * Get client IP from request headers
 * Handles proxies (X-Forwarded-For) and direct connections
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback — not reliable but better than nothing
  return "unknown";
}

/**
 * Create a rate limit key from IP and endpoint
 */
export function createRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}

/**
 * Apply rate limit check to a request
 * Returns the response if rate limited, null if allowed
 */
export function rateLimitRequest(
  req: Request,
  endpointType: keyof typeof RATE_LIMIT_CONFIGS = "api"
): NextResponse | null {
  const ip = getClientIp(req);
  const url = new URL(req.url);
  const key = createRateLimitKey(ip, url.pathname);
  const config = RATE_LIMIT_CONFIGS[endpointType];

  const result = checkRateLimit(key, config);

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests",
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfter),
          "X-RateLimit-Limit": String(config.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        },
      }
    );
  }

  return null; // Allowed
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  result: { remaining: number; resetAt: number },
  config: RateLimitConfig
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(config.limit),
    "X-RateLimit-Remaining": String(Math.max(0, result.remaining)),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}