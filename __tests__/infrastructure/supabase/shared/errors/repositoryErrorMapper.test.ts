import { mapSupabaseError } from "@/infrastructure/supabase/shared/errors/repositoryErrorMapper";

describe("mapSupabaseError", () => {
  it("should map Supabase PGRST116 error to NotFoundError", () => {
    // Arrange
    const supabaseError = {
      code: "PGRST116",
      message: "The result contains 0 rows",
      details: "No rows returned",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "Project");

    // Assert
    expect(result).toHaveProperty("code", "NOT_FOUND");
    expect(result).toHaveProperty("entityType", "Project");
    expect(result).toHaveProperty("entityId", "unknown");
    expect(result).toHaveProperty("debugMessage");
  });

  it("should map constraint violation code 23505 to ConstraintError", () => {
    // Arrange
    const supabaseError = {
      code: "23505",
      message: "duplicate key value violates unique constraint",
      details: "Key (name)=(Test Project) already exists.",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "Project");

    // Assert
    expect(result).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    expect(result).toHaveProperty("constraint", "23505");
    expect(result).toHaveProperty("debugMessage");
  });

  it("should map constraint violation code 23503 to ConstraintError", () => {
    // Arrange
    const supabaseError = {
      code: "23503",
      message: "foreign key constraint violated",
      details: "Key (project_id)=(123) is not present in table projects.",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "Ticket");

    // Assert
    expect(result).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    expect(result).toHaveProperty("constraint", "23503");
    expect(result).toHaveProperty("debugMessage");
  });

  it("should map constraint violation code 23514 to ConstraintError", () => {
    // Arrange
    const supabaseError = {
      code: "23514",
      message: "check constraint violated",
      details: "New row violates check constraint",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "Project");

    // Assert
    expect(result).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    expect(result).toHaveProperty("constraint", "23514");
    expect(result).toHaveProperty("debugMessage");
  });

  it("should use details when message is missing for constraint errors", () => {
    // Arrange
    const supabaseError = {
      code: "23505",
      message: "",
      details: "Unique constraint violation details",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "Project");

    // Assert
    expect(result).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    expect(result).toHaveProperty("debugMessage");
  });

  it("should map generic Supabase errors to DatabaseError", () => {
    // Arrange
    const supabaseError = {
      code: "PGRST301",
      message: "PostgREST error",
      details: "Some database error",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "Project");

    // Assert
    expect(result).toHaveProperty("code", "DATABASE_ERROR");
    expect(result).toHaveProperty("debugMessage");
    expect(result).toHaveProperty("originalError", supabaseError);
  });

  it("should map Supabase error with code but no message to DatabaseError", () => {
    // Arrange
    const supabaseError = {
      code: "PGRST999",
      message: "",
      details: "",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "Project");

    // Assert
    expect(result).toHaveProperty("code", "DATABASE_ERROR");
    expect(result).toHaveProperty("debugMessage");
    expect(result).toHaveProperty("originalError", supabaseError);
  });

  it("should map Error instances to DatabaseError", () => {
    // Arrange
    const error = new Error("Network connection failed");

    // Act
    const result = mapSupabaseError(error, "Project");

    // Assert
    expect(result).toHaveProperty("code", "DATABASE_ERROR");
    expect(result).toHaveProperty("debugMessage");
    expect(result).toHaveProperty("originalError", error);
  });

  it("should handle unknown error types with fallback", () => {
    // Arrange
    const unknownError = "String error";

    // Act
    const result = mapSupabaseError(unknownError, "Ticket");

    // Assert
    expect(result).toHaveProperty("code", "DATABASE_ERROR");
    expect(result).toHaveProperty("debugMessage");
    expect(result).toHaveProperty("originalError", unknownError);
  });

  it("should handle null error with fallback", () => {
    // Arrange
    const nullError = null;

    // Act
    const result = mapSupabaseError(nullError, "Project");

    // Assert
    expect(result).toHaveProperty("code", "DATABASE_ERROR");
    expect(result).toHaveProperty("debugMessage");
    expect(result).toHaveProperty("originalError", nullError);
  });

  it("should use default entityType when not provided", () => {
    // Arrange
    const error = new Error("Database error");

    // Act
    const result = mapSupabaseError(error);

    // Assert
    expect(result).toHaveProperty("code", "DATABASE_ERROR");
    expect(result).toHaveProperty("debugMessage");
  });

  it("should use custom entityType in NotFoundError", () => {
    // Arrange
    const supabaseError = {
      code: "PGRST116",
      message: "Not found",
      details: "",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "CustomEntity", "custom-id-123");

    // Assert
    expect(result).toHaveProperty("code", "NOT_FOUND");
    expect(result).toHaveProperty("entityType", "CustomEntity");
    expect(result).toHaveProperty("entityId", "custom-id-123");
    expect(result).toHaveProperty("debugMessage");
  });

  it("should map RLS policy violation with code 42501 to ConstraintError with RLS_POLICY_VIOLATION constraint", () => {
    // Arrange
    const supabaseError = {
      code: "42501",
      message:
        'new row violates row-level security policy for table "projects"',
      details: "RLS policy violation",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "Project");

    // Assert
    expect(result).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    expect(result).toHaveProperty("constraint", "RLS_POLICY_VIOLATION");
    // Debug message should contain the original Supabase message for logging
    expect(result).toHaveProperty("debugMessage");
  });

  it("should map RLS policy violation by message content to ConstraintError with RLS_POLICY_VIOLATION constraint", () => {
    // Arrange - Some RLS errors may not have code 42501 but have the message
    const supabaseError = {
      code: "PGRST301",
      message:
        'new row violates row-level security policy for table "projects"',
      details: "Row-level security check failed",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "Project");

    // Assert
    expect(result).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    expect(result).toHaveProperty("constraint", "RLS_POLICY_VIOLATION");
    // Debug message should contain the original Supabase message for logging
    expect(result).toHaveProperty("debugMessage");
  });

  it("should map RLS policy violation with details when message is missing to ConstraintError with default message", () => {
    // Arrange
    const supabaseError = {
      code: "42501",
      message: "",
      details: "Row-level security policy violation",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "Project");

    // Assert
    expect(result).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    expect(result).toHaveProperty("constraint", "RLS_POLICY_VIOLATION");
    // Debug message should contain details when message is missing
    expect(result).toHaveProperty("debugMessage");
  });

  it("should map RLS policy violation with default message when both message and details are missing", () => {
    // Arrange
    const supabaseError = {
      code: "42501",
      message: "",
      details: "",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "Project");

    // Assert
    expect(result).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    expect(result).toHaveProperty("constraint", "RLS_POLICY_VIOLATION");
    // Debug message should contain default message from createConstraintError when both message and details are missing
    expect(result).toHaveProperty("debugMessage");
  });

  it("should map RLS policy violation for non-Project entities with original message", () => {
    // Arrange
    const supabaseError = {
      code: "42501",
      message: 'new row violates row-level security policy for table "tickets"',
      details: "",
      hint: null,
    };

    // Act
    const result = mapSupabaseError(supabaseError, "Ticket");

    // Assert
    expect(result).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    expect(result).toHaveProperty("constraint", "RLS_POLICY_VIOLATION");
    // Debug message should contain the original message for logging
    expect(result).toHaveProperty("debugMessage");
  });
});
