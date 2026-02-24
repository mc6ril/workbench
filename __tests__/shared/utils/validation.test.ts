import { z, ZodError } from "zod";

import {
  formatValidationErrors,
  safeValidateWithSchema,
  validateEmail,
  validateRequired,
  validateUrl,
  validateWithSchema,
} from "@/shared/utils/validation";

const testSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

describe("validateWithSchema", () => {
  it("should return parsed data for valid input", () => {
    const result = validateWithSchema(testSchema, {
      name: "John",
      email: "john@example.com",
    });

    expect(result).toEqual({ name: "John", email: "john@example.com" });
  });

  it("should throw ZodError for invalid input", () => {
    expect(() =>
      validateWithSchema(testSchema, { name: "", email: "invalid" })
    ).toThrow(ZodError);
  });
});

describe("safeValidateWithSchema", () => {
  it("should return success result for valid input", () => {
    const result = safeValidateWithSchema(testSchema, {
      name: "John",
      email: "john@example.com",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: "John", email: "john@example.com" });
    }
  });

  it("should return error result for invalid input", () => {
    const result = safeValidateWithSchema(testSchema, {
      name: "",
      email: "invalid",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ZodError);
    }
  });
});

describe("formatValidationErrors", () => {
  it("should format field errors as field-to-message mapping", () => {
    const result = testSchema.safeParse({ name: "", email: "invalid" });
    if (result.success) {
      throw new Error("Expected validation to fail");
    }

    const errors = formatValidationErrors(result.error);

    expect(errors).toHaveProperty("name");
    expect(errors).toHaveProperty("email");
  });

  it("should use _global key for errors without a path", () => {
    const schema = z.string().min(1, "Required");
    const result = schema.safeParse("");
    if (result.success) {
      throw new Error("Expected validation to fail");
    }

    const errors = formatValidationErrors(result.error);

    expect(errors).toHaveProperty("_global");
  });
});

describe("validateEmail", () => {
  it("should return true for valid emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("user+tag@sub.example.com")).toBe(true);
  });

  it("should return false for invalid emails", () => {
    expect(validateEmail("invalid")).toBe(false);
    expect(validateEmail("@example.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
  });
});

describe("validateUrl", () => {
  it("should return true for valid URLs", () => {
    expect(validateUrl("https://example.com")).toBe(true);
    expect(validateUrl("http://localhost:3000")).toBe(true);
  });

  it("should return false for invalid URLs", () => {
    expect(validateUrl("not-a-url")).toBe(false);
    expect(validateUrl("")).toBe(false);
  });
});

describe("validateRequired", () => {
  it("should return true for non-empty strings", () => {
    expect(validateRequired("hello")).toBe(true);
    expect(validateRequired("a")).toBe(true);
  });

  it("should return false for empty strings", () => {
    expect(validateRequired("")).toBe(false);
  });

  it("should return false for null and undefined", () => {
    expect(validateRequired(null)).toBe(false);
    expect(validateRequired(undefined)).toBe(false);
  });

  it("should return false for whitespace-only strings", () => {
    expect(validateRequired("   ")).toBe(false);
  });
});
