import { mapSupabaseError } from "@/shared/infrastructure/errors/repositoryErrorMapper";

describe("mapSupabaseError custom business cases", () => {
  it("maps LAST_ADMIN_REQUIRED trigger errors to a named constraint", () => {
    const supabaseError = {
      code: "P0001",
      message: "LAST_ADMIN_REQUIRED",
      details: "",
      hint: null,
    };

    const result = mapSupabaseError(supabaseError, "ProjectMember");

    expect(result).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    expect(result).toMatchObject({
      context: { constraint: "LAST_ADMIN_REQUIRED" },
    });
  });

  it("maps expired invitation RPC errors to a named constraint", () => {
    const supabaseError = {
      code: "P0003",
      message: "Invitation has expired",
      details: "",
      hint: null,
    };

    const result = mapSupabaseError(supabaseError, "ProjectInvitation");

    expect(result).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    expect(result).toMatchObject({
      context: { constraint: "INVITATION_EXPIRED" },
    });
  });

  it("maps already-member invitation RPC errors to a named constraint", () => {
    const supabaseError = {
      code: "P0004",
      message: "Already a member of this project",
      details: "",
      hint: null,
    };

    const result = mapSupabaseError(supabaseError, "ProjectInvitation");

    expect(result).toHaveProperty("code", "CONSTRAINT_VIOLATION");
    expect(result).toMatchObject({
      context: { constraint: "INVITATION_ALREADY_MEMBER" },
    });
  });
});
