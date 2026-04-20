import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import {
  buildAuthCallbackPath,
  getAuthCodeRedirectTarget,
  sanitizeInternalRedirectPath,
  VERIFIED_EMAIL_REDIRECT_PATH,
} from "@/shared/utils/authRedirect";

describe("authRedirect", () => {
  describe("sanitizeInternalRedirectPath", () => {
    it("keeps safe internal paths", () => {
      expect(sanitizeInternalRedirectPath(PAGE_ROUTES.WORKSPACE)).toBe(
        PAGE_ROUTES.WORKSPACE
      );
      expect(sanitizeInternalRedirectPath(VERIFIED_EMAIL_REDIRECT_PATH)).toBe(
        VERIFIED_EMAIL_REDIRECT_PATH
      );
    });

    it("falls back for unsafe paths", () => {
      expect(sanitizeInternalRedirectPath("https://evil.test")).toBe(
        PAGE_ROUTES.HOME
      );
      expect(sanitizeInternalRedirectPath("//evil.test")).toBe(
        PAGE_ROUTES.HOME
      );
      expect(
        sanitizeInternalRedirectPath(undefined, PAGE_ROUTES.WORKSPACE)
      ).toBe(PAGE_ROUTES.WORKSPACE);
    });
  });

  describe("buildAuthCallbackPath", () => {
    it("builds a callback path with the encoded next route", () => {
      expect(
        buildAuthCallbackPath({
          nextPath: VERIFIED_EMAIL_REDIRECT_PATH,
        })
      ).toBe(
        `${AUTH_PAGE_ROUTES.CALLBACK}?next=%2Fauth%2Fverify-email%3Fverified%3D1`
      );
    });

    it("includes the code when routing a fallback redirect back through the callback", () => {
      expect(
        buildAuthCallbackPath({
          code: "abc123",
          nextPath: PAGE_ROUTES.WORKSPACE,
          fallbackPath: PAGE_ROUTES.WORKSPACE,
        })
      ).toBe(`${AUTH_PAGE_ROUTES.CALLBACK}?next=%2Fworkspace&code=abc123`);
    });
  });

  describe("getAuthCodeRedirectTarget", () => {
    it("routes recovery codes to the update password page", () => {
      expect(getAuthCodeRedirectTarget("recovery")).toBe(
        AUTH_PAGE_ROUTES.UPDATE_PASSWORD
      );
    });

    it("routes signup verification codes to the verified email page", () => {
      expect(getAuthCodeRedirectTarget("signup")).toBe(
        VERIFIED_EMAIL_REDIRECT_PATH
      );
      expect(getAuthCodeRedirectTarget(null)).toBe(
        VERIFIED_EMAIL_REDIRECT_PATH
      );
    });
  });
});
