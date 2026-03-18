import { z } from "zod";

import {
  SignUpFormSchema,
  SignUpSchema,
} from "@/domains/project-management/core/domain/schema/auth.schema";

describe("SignUpSchema", () => {
  const validInput = {
    email: "test@example.com",
    password: "password123",
  };

  it("should accept valid input without optional fields", () => {
    const result = SignUpSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should accept input with displayName", () => {
    const result = SignUpSchema.safeParse({
      ...validInput,
      displayName: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("should accept input with termsAcceptedAt", () => {
    const result = SignUpSchema.safeParse({
      ...validInput,
      termsAcceptedAt: "2026-02-20T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("should trim displayName", () => {
    const result = SignUpSchema.safeParse({
      ...validInput,
      displayName: "  Test User  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayName).toBe("Test User");
    }
  });

  it("should reject displayName exceeding 100 characters", () => {
    const result = SignUpSchema.safeParse({
      ...validInput,
      displayName: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

describe("SignUpFormSchema", () => {
  const validFormInput = {
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password123",
    acceptedTerms: true as const,
  };

  it("should accept valid form input with terms accepted", () => {
    const result = SignUpFormSchema.safeParse(validFormInput);
    expect(result.success).toBe(true);
  });

  it("should reject when acceptedTerms is false", () => {
    const result = SignUpFormSchema.safeParse({
      ...validFormInput,
      acceptedTerms: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const termsError = result.error.issues.find(
        (issue: z.ZodIssue) => issue.path.includes("acceptedTerms")
      );
      expect(termsError).toBeDefined();
    }
  });

  it("should reject when acceptedTerms is missing", () => {
    const { acceptedTerms: _, ...inputWithoutTerms } = validFormInput;
    const result = SignUpFormSchema.safeParse(inputWithoutTerms);
    expect(result.success).toBe(false);
  });

  it("should reject when passwords do not match", () => {
    const result = SignUpFormSchema.safeParse({
      ...validFormInput,
      confirmPassword: "different123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const mismatchError = result.error.issues.find(
        (issue: z.ZodIssue) => issue.path.includes("confirmPassword")
      );
      expect(mismatchError).toBeDefined();
    }
  });

  it("should reject when confirmPassword is empty", () => {
    const result = SignUpFormSchema.safeParse({
      ...validFormInput,
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
  });

  it("should accept form input with optional displayName", () => {
    const result = SignUpFormSchema.safeParse({
      ...validFormInput,
      displayName: "Test User",
    });
    expect(result.success).toBe(true);
  });
});
