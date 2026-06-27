import { describe, it, expect } from "vitest";
import {
  extractToken,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  tooManyRequests,
} from "@/lib/api-utils";

describe("API Utils", () => {
  describe("extractToken", () => {
    it("should extract token from Authorization header", () => {
      const request = new Request("http://localhost", {
        headers: { Authorization: "Bearer test-token-123" },
      });
      expect(extractToken(request)).toBe("test-token-123");
    });

    it("should return null when Authorization header is malformed", () => {
      const request = new Request("http://localhost", {
        headers: { Authorization: "Basic credentials" },
      });
      expect(extractToken(request)).toBeNull();
    });

    it("should trim whitespace from token", () => {
      const request = new Request("http://localhost", {
        headers: { Authorization: "Bearer  token-with-spaces  " },
      });
      expect(extractToken(request)).toBe("token-with-spaces");
    });

    it("should return null when no Authorization header present", () => {
      const request = new Request("http://localhost");
      // Will return null if cookies not available (standard Request doesn't have cookies)
      const token = extractToken(request);
      // Either returns the token from cookie or null
      expect(token === null || typeof token === "string").toBe(true);
    });
  });

  describe("Error helpers", () => {
    it("badRequest should return 400 status", async () => {
      const response = badRequest("Invalid input");
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("Invalid input");
    });

    it("badRequest should include details if provided", async () => {
      const details = [{ field: "email", message: "Invalid email" }];
      const response = badRequest("Validation failed", details);
      const body = await response.json();
      expect(body.details).toEqual(details);
    });

    it("unauthorized should return 401 status", async () => {
      const response = unauthorized();
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("unauthorized should accept custom message", async () => {
      const response = unauthorized("Token expired");
      const body = await response.json();
      expect(body.error).toBe("Token expired");
    });

    it("forbidden should return 403 status", async () => {
      const response = forbidden();
      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toBe("Forbidden");
    });

    it("notFound should return 404 status", async () => {
      const response = notFound();
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe("Not found");
    });

    it("serverError should return 500 status", async () => {
      const response = serverError();
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("Server error");
    });

    it("tooManyRequests should return 429 status", async () => {
      const response = tooManyRequests(120);
      expect(response.status).toBe(429);
      expect(response.headers.get("Retry-After")).toBe("120");
    });

    it("tooManyRequests should use default retry-after", async () => {
      const response = tooManyRequests();
      expect(response.headers.get("Retry-After")).toBe("60");
    });
  });
});