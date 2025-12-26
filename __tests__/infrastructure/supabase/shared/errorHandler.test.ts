import {
  createConstraintError,
  createDatabaseError,
} from "@/core/domain/repositoryError";

import { handleRepositoryError } from "@/infrastructure/supabase/shared/errors/errorHandlers";

describe("handleRepositoryError", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should re-throw domain errors with matching codes", () => {
    const domainError = createConstraintError(
      "23505",
      "Unique constraint violation"
    );

    expect(() => {
      handleRepositoryError(domainError, "Test");
    }).toThrow();

    // Verify that the same error is thrown
    try {
      handleRepositoryError(domainError, "Test");
    } catch (error) {
      expect(error).toBe(domainError);
      expect(error).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    }
  });

  it("should map and throw unknown errors", () => {
    const unknownError = new Error("Database connection failed");

    expect(() => {
      handleRepositoryError(unknownError, "Test");
    }).toThrow();

    // Verify that mapSupabaseError would be called
    try {
      handleRepositoryError(unknownError, "Test");
    } catch (error) {
      expect(error).toHaveProperty("code");
      expect(error).toHaveProperty("message");
    }
  });

  it("should not re-throw errors with non-matching codes", () => {
    const errorWithWrongCode = {
      code: "UNKNOWN_ERROR",
      message: "This should be mapped",
    };

    expect(() => {
      handleRepositoryError(errorWithWrongCode, "Test");
    }).toThrow();

    // Should call mapSupabaseError, not re-throw
    try {
      handleRepositoryError(errorWithWrongCode, "Test");
    } catch (error) {
      // Should be a mapped error, not the original
      expect(error).not.toBe(errorWithWrongCode);
      // Should have repository error code
      expect(error).toHaveProperty("code");
      expect(["NOT_FOUND", "CONSTRAINT_VIOLATION", "DATABASE_ERROR"]).toContain(
        (error as { code: string }).code
      );
    }
  });

  it("should use default entityType when not provided", () => {
    const unknownError = new Error("Database error");

    expect(() => {
      handleRepositoryError(unknownError);
    }).toThrow();
  });
});
