import { ZodError } from "zod";

import {
  isNetworkError,
  isValidationError,
} from "@/shared/utils/errorHandling";

describe("isValidationError", () => {
  it("should return true for ZodError instances", () => {
    const zodError = new ZodError([]);
    expect(isValidationError(zodError)).toBe(true);
  });

  it("should return false for regular Error", () => {
    expect(isValidationError(new Error("test"))).toBe(false);
  });

  it("should return false for non-error values", () => {
    expect(isValidationError("string")).toBe(false);
    expect(isValidationError(null)).toBe(false);
    expect(isValidationError(undefined)).toBe(false);
  });
});

describe("isNetworkError", () => {
  it("should return true for TypeError with fetch message", () => {
    expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
  });

  it("should return true for TypeError with network message", () => {
    expect(isNetworkError(new TypeError("Network request failed"))).toBe(true);
  });

  it("should return false for TypeError without network keywords", () => {
    expect(isNetworkError(new TypeError("Cannot read property"))).toBe(false);
  });

  it("should return false for regular Error even with network message", () => {
    expect(isNetworkError(new Error("Failed to fetch"))).toBe(false);
  });

  it("should return false for non-error values", () => {
    expect(isNetworkError("string")).toBe(false);
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
  });
});
