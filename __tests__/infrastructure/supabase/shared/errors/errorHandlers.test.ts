import { createConstraintError } from "@/core/domain/repositoryError";

import {
  handleAuthError,
  handleRepositoryError,
} from "@/infrastructure/supabase/shared/errors/errorHandlers";

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

    try {
      handleRepositoryError(domainError, "Test");
    } catch (error) {
      expect(error).toBe(domainError);
      expect(error).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    }
  });

  it("should map unknown errors via mapSupabaseError", () => {
    const unknownError = {
      code: "UNKNOWN_CODE",
      message: "Unknown error",
    };

    expect(() => {
      handleRepositoryError(unknownError, "Test");
    }).toThrow();

    try {
      handleRepositoryError(unknownError, "Test");
    } catch (error) {
      expect(error).toHaveProperty("code", "DATABASE_ERROR");
      expect(error).toHaveProperty("debugMessage");
    }
  });

  it("should map generic errors to DatabaseError", () => {
    const genericError = new Error("Generic error message");

    expect(() => {
      handleRepositoryError(genericError, "Test");
    }).toThrow();

    try {
      handleRepositoryError(genericError, "Test");
    } catch (error) {
      expect(error).toHaveProperty("code", "DATABASE_ERROR");
      expect(error).toHaveProperty("debugMessage");
    }
  });
});

describe("handleAuthError", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should re-throw domain auth errors with matching codes", () => {
    // Arrange
    const domainAuthError = {
      code: "INVALID_CREDENTIALS",
      debugMessage: "Invalid email or password",
    };

    expect(() => {
      handleAuthError(domainAuthError);
    }).toThrow();

    // Verify that the same error is thrown
    try {
      handleAuthError(domainAuthError);
    } catch (error) {
      expect(error).toBe(domainAuthError);
      expect(error).toHaveProperty("code", "INVALID_CREDENTIALS");
    }
  });

  it("should re-throw different domain auth error codes", () => {
    // Arrange - test multiple auth error codes
    const authErrors = [
      {
        code: "EMAIL_ALREADY_EXISTS",
        debugMessage: "Email already registered",
      },
      { code: "WEAK_PASSWORD", debugMessage: "Password is too weak" },
      { code: "INVALID_TOKEN", debugMessage: "Token is invalid" },
      {
        code: "EMAIL_VERIFICATION_ERROR",
        debugMessage: "Email verification failed",
      },
    ];

    authErrors.forEach((authError) => {
      expect(() => {
        handleAuthError(authError);
      }).toThrow();

      try {
        handleAuthError(authError);
      } catch (error) {
        expect(error).toBe(authError);
        expect(error).toHaveProperty("code", authError.code);
      }
    });
  });

  it("should map unknown errors via mapSupabaseAuthError", () => {
    // Arrange
    const unknownError = {
      code: "UNKNOWN_AUTH_ERROR",
      message: "Unknown authentication error",
    };

    expect(() => {
      handleAuthError(unknownError);
    }).toThrow();

    try {
      handleAuthError(unknownError);
    } catch (error: unknown) {
      // Verify that the error was mapped (not the original error)
      expect(error).not.toBe(unknownError);
      expect(error).toHaveProperty("code");
      expect(error).toHaveProperty("debugMessage");
    }
  });

  it("should not re-throw errors with non-matching codes", () => {
    // Arrange - error with code that doesn't match auth error pattern
    const nonAuthError = {
      code: "DATABASE_ERROR",
      debugMessage: "Database connection failed",
    };

    expect(() => {
      handleAuthError(nonAuthError);
    }).toThrow();

    try {
      handleAuthError(nonAuthError);
    } catch (error: unknown) {
      // Verify that the error was mapped (not the original error)
      expect(error).not.toBe(nonAuthError);
      expect(error).toHaveProperty("code");
      expect(error).toHaveProperty("debugMessage");
    }
  });

  it("should map Supabase auth errors via mapSupabaseAuthError", () => {
    // Arrange - simulate Supabase auth error structure
    const supabaseAuthError = {
      code: "auth/invalid-credentials",
      message: "Invalid login credentials",
    };

    expect(() => {
      handleAuthError(supabaseAuthError);
    }).toThrow();

    try {
      handleAuthError(supabaseAuthError);
    } catch (error: unknown) {
      // Verify that the error was mapped to domain error
      expect(error).not.toBe(supabaseAuthError);
      expect(error).toHaveProperty("code");
      expect(error).toHaveProperty("debugMessage");
    }
  });
});
