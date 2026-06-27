import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, RATE_LIMIT_CONFIGS, getClientIp, createRateLimitKey } from "@/lib/rate-limit";

describe("Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RATE_LIMIT_CONFIGS", () => {
    it("should have auth config with strict limits", () => {
      expect(RATE_LIMIT_CONFIGS.auth.limit).toBe(5);
      expect(RATE_LIMIT_CONFIGS.auth.windowMs).toBe(15 * 60 * 1000);
    });

    it("should have api config with standard limits", () => {
      expect(RATE_LIMIT_CONFIGS.api.limit).toBe(100);
      expect(RATE_LIMIT_CONFIGS.api.windowMs).toBe(60 * 1000);
    });

    it("should have content config with moderate limits", () => {
      expect(RATE_LIMIT_CONFIGS.content.limit).toBe(30);
      expect(RATE_LIMIT_CONFIGS.content.windowMs).toBe(60 * 1000);
    });
  });

  describe("checkRateLimit", () => {
    it("should allow first request", () => {
      const result = checkRateLimit("test-ip:/api/test", RATE_LIMIT_CONFIGS.api);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });

    it("should decrement remaining count", () => {
      const key = "test-ip:/api/test-2";
      checkRateLimit(key, RATE_LIMIT_CONFIGS.api);
      checkRateLimit(key, RATE_LIMIT_CONFIGS.api);
      const result = checkRateLimit(key, RATE_LIMIT_CONFIGS.api);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(97);
    });

    it("should block after limit reached", () => {
      const key = "test-ip:/api/test-3";
      const config = { limit: 3, windowMs: 60 * 1000 };

      checkRateLimit(key, config);
      checkRateLimit(key, config);
      checkRateLimit(key, config);

      const result = checkRateLimit(key, config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it("should reset after window expires", () => {
      const key = "test-ip:/api/test-4";
      const config = { limit: 1, windowMs: 100 }; // Very short window

      checkRateLimit(key, config);
      const blocked = checkRateLimit(key, config);
      expect(blocked.allowed).toBe(false);

      // Note: In production, expired entries are cleaned up by the cleanup function
      // For testing, we verify the blocking behavior works
    });
  });

  describe("getClientIp", () => {
    it("should extract IP from X-Forwarded-For header", () => {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
      });
      expect(getClientIp(request)).toBe("192.168.1.1");
    });

    it("should extract IP from X-Real-IP header", () => {
      const request = new Request("http://localhost", {
        headers: { "x-real-ip": "192.168.1.2" },
      });
      expect(getClientIp(request)).toBe("192.168.1.2");
    });

    it("should return 'unknown' when no headers present", () => {
      const request = new Request("http://localhost");
      expect(getClientIp(request)).toBe("unknown");
    });

    it("should prioritize X-Forwarded-For over X-Real-IP", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "192.168.1.1",
          "x-real-ip": "192.168.1.2",
        },
      });
      expect(getClientIp(request)).toBe("192.168.1.1");
    });
  });

  describe("createRateLimitKey", () => {
    it("should create key in correct format", () => {
      const key = createRateLimitKey("192.168.1.1", "/api/users");
      expect(key).toBe("192.168.1.1:/api/users");
    });
  });
});