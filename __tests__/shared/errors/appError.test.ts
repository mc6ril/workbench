import {
  createAppError,
  getAppErrorCode,
  isAppError,
  normalizeToAppError,
} from "@/shared/errors/appError";
import { APP_ERROR_CODE, AUTH_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { createNotFoundError } from "@/shared/errors/repositoryError";

describe("AppError", () => {
  it("createAppError sets _tag and code", () => {
    const err = createAppError(AUTH_ERROR_CODE.INVALID_CREDENTIALS, {
      debugMessage: "supabase message",
    });
    expect(err._tag).toBe("AppError");
    expect(err.code).toBe("INVALID_CREDENTIALS");
    expect(err.debugMessage).toBe("supabase message");
  });

  it("isAppError returns true for createAppError result", () => {
    const err = createAppError(APP_ERROR_CODE.NOT_FOUND, {
      context: { entityType: "Ticket", entityId: "x" },
    });
    expect(isAppError(err)).toBe(true);
  });

  it("isAppError returns false for plain Error", () => {
    expect(isAppError(new Error("x"))).toBe(false);
  });

  it("normalizeToAppError maps legacy not-found shape without _tag", () => {
    const legacy = {
      code: "NOT_FOUND" as const,
      entityType: "Project",
      entityId: "p1",
      debugMessage: "gone",
    };
    const normalized = normalizeToAppError(legacy);
    expect(normalized).not.toBeNull();
    expect(isAppError(normalized)).toBe(true);
    expect(normalized?.context?.entityType).toBe("Project");
    expect(normalized?.context?.entityId).toBe("p1");
  });

  it("normalizeToAppError accepts createNotFoundError", () => {
    const err = createNotFoundError("Board", "b1");
    const normalized = normalizeToAppError(err);
    expect(normalized?.code).toBe("NOT_FOUND");
    expect(isAppError(normalized)).toBe(true);
  });

  it("normalizeToAppError returns null for unknown code", () => {
    expect(normalizeToAppError({ code: "UNKNOWN_XYZ" })).toBeNull();
  });

  it("getAppErrorCode returns code from AppError", () => {
    const err = createAppError(AUTH_ERROR_CODE.INVALID_EMAIL);
    expect(getAppErrorCode(err)).toBe("INVALID_EMAIL");
  });

  it("getAppErrorCode returns undefined for non-app errors", () => {
    expect(getAppErrorCode(new Error("x"))).toBeUndefined();
  });
});
