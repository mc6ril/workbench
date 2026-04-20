import { createAppError } from "@/shared/errors/appError";
import {
  AUTH_ERROR_CODE,
  REPOSITORY_ERROR_CODE,
} from "@/shared/errors/appErrorCodes";
import {
  getErrorMessage,
  getErrorMessageFromAppError,
} from "@/shared/i18n/errorMessages";

const echoT = (key: string): string => key;

describe("getErrorMessage", () => {
  it("maps auth code to nested i18n key path", () => {
    const err = createAppError(AUTH_ERROR_CODE.INVALID_CREDENTIALS);
    expect(getErrorMessage(err, echoT)).toBe("auth.INVALID_CREDENTIALS");
  });

  it("uses NOT_FOUND_WITH_ENTITY when entity context is present", () => {
    const err = createAppError(REPOSITORY_ERROR_CODE.NOT_FOUND, {
      context: { entityType: "Ticket", entityId: "t1" },
    });
    expect(getErrorMessage(err, echoT)).toBe(
      "repository.NOT_FOUND_WITH_ENTITY"
    );
  });

  it("maps domain constraint to domain i18n key", () => {
    const err = createAppError(REPOSITORY_ERROR_CODE.CONSTRAINT_VIOLATION, {
      context: { constraint: "LAST_ADMIN_REQUIRED" },
    });
    expect(getErrorMessage(err, echoT)).toBe("domain.LAST_ADMIN_REQUIRED");
  });

  it("returns generic for unknown error", () => {
    expect(getErrorMessage(new Error("boom"), echoT)).toBe("generic");
  });
});

describe("getErrorMessageFromAppError", () => {
  it("matches getErrorMessage for AppError", () => {
    const err = createAppError(AUTH_ERROR_CODE.SAME_PASSWORD);
    expect(getErrorMessageFromAppError(err, echoT)).toBe("auth.SAME_PASSWORD");
  });
});
