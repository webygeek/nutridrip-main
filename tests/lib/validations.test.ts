import { describe, it, expect } from "vitest";
import {
  loginSchema,
  userCreateSchema,
  userUpdateSchema,
  contentBlockSchema,
  bookingCreateSchema,
  userDeleteSchema,
} from "@/lib/validations";

describe("Validations", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "12345",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing fields", () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject empty email", () => {
      const result = loginSchema.safeParse({
        email: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject email exceeding max length", () => {
      const longEmail = "a".repeat(250) + "@test.com";
      const result = loginSchema.safeParse({
        email: longEmail,
        password: "password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("userCreateSchema", () => {
    it("should validate correct user creation data", () => {
      const result = userCreateSchema.safeParse({
        email: "newuser@example.com",
        password: "password123",
        name: "John Doe",
        role: "patient",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid role", () => {
      const result = userCreateSchema.safeParse({
        email: "newuser@example.com",
        password: "password123",
        name: "John Doe",
        role: "superadmin", // Invalid role
      });
      expect(result.success).toBe(false);
    });

    it("should accept all valid roles", () => {
      const roles = ["patient", "doctor", "admin", "subadmin", "clinic", "nurse"];
      for (const role of roles) {
        const result = userCreateSchema.safeParse({
          email: `user-${role}@example.com`,
          password: "password123",
          name: "Test User",
          role,
        });
        expect(result.success).toBe(true);
      }
    });

    it("should accept optional phone", () => {
      const result = userCreateSchema.safeParse({
        email: "user@example.com",
        password: "password123",
        name: "John Doe",
        role: "patient",
        phone: "+91 98765 43210",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("userUpdateSchema", () => {
    it("should validate partial update with id", () => {
      const result = userUpdateSchema.safeParse({
        id: "test-id",
        name: "Updated Name",
      });
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const result = userUpdateSchema.safeParse({
        name: "Updated Name",
      });
      expect(result.success).toBe(false);
    });

    it("should accept status update", () => {
      const result = userUpdateSchema.safeParse({
        id: "test-id",
        status: "inactive",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = userUpdateSchema.safeParse({
        id: "test-id",
        status: "deleted", // Invalid status
      });
      expect(result.success).toBe(false);
    });
  });

  describe("contentBlockSchema", () => {
    it("should validate correct content block", () => {
      const result = contentBlockSchema.safeParse({
        key: "home.hero.title",
        value: "Welcome to NutriDrip",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty key", () => {
      const result = contentBlockSchema.safeParse({
        key: "",
        value: "Some value",
      });
      expect(result.success).toBe(false);
    });

    it("should accept long values", () => {
      const result = contentBlockSchema.safeParse({
        key: "test.key",
        value: "a".repeat(50000),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bookingCreateSchema", () => {
    it("should validate correct booking data", () => {
      const result = bookingCreateSchema.safeParse({
        dripId: "test-cuid-id",
        scheduledAt: "2024-12-25T10:00:00.000Z",
        location: "home",
      });
      expect(result.success).toBe(true);
    });

    it("should default location to 'home'", () => {
      const result = bookingCreateSchema.safeParse({
        dripId: "test-cuid-id",
        scheduledAt: "2024-12-25T10:00:00.000Z",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.location).toBe("home");
      }
    });

    it("should reject invalid location", () => {
      const result = bookingCreateSchema.safeParse({
        dripId: "test-cuid-id",
        scheduledAt: "2024-12-25T10:00:00.000Z",
        location: "airport", // Invalid location
      });
      expect(result.success).toBe(false);
    });

    it("should accept all valid locations", () => {
      const locations = ["home", "clinic", "office", "hotel"];
      for (const location of locations) {
        const result = bookingCreateSchema.safeParse({
          dripId: "test-cuid-id",
          scheduledAt: "2024-12-25T10:00:00.000Z",
          location,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("userDeleteSchema", () => {
    it("should validate correct delete data", () => {
      const result = userDeleteSchema.safeParse({
        id: "test-id",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty id", () => {
      const result = userDeleteSchema.safeParse({
        id: "",
      });
      expect(result.success).toBe(false);
    });
  });
});