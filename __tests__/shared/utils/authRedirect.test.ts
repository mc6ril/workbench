import {
  buildAuthCallbackPath,
  getAuthCodeRedirectTarget,
  sanitizeInternalRedirectPath,
  VERIFIED_EMAIL_REDIRECT_PATH,
} from "@/shared/utils/authRedirect";

describe("authRedirect", () => {
  describe("sanitizeInternalRedirectPath", () => {
    it("keeps safe internal paths", () => {
      expect(sanitizeInternalRedirectPath("/workspace")).toBe("/workspace");
      expect(sanitizeInternalRedirectPath("/auth/verify-email?verified=1")).toBe(
        "/auth/verify-email?verified=1"
      );
    });

    it("falls back for unsafe paths", () => {
      expect(sanitizeInternalRedirectPath("https://evil.test")).toBe("/");
      expect(sanitizeInternalRedirectPath("//evil.test")).toBe("/");
      expect(sanitizeInternalRedirectPath(undefined, "/workspace")).toBe(
        "/workspace"
      );
    });
  });

  describe("buildAuthCallbackPath", () => {
    it("builds a callback path with the encoded next route", () => {
      expect(
        buildAuthCallbackPath({
          nextPath: VERIFIED_EMAIL_REDIRECT_PATH,
        })
      ).toBe(
        "/auth/callback?next=%2Fauth%2Fverify-email%3Fverified%3D1"
      );
    });

    it("includes the code when routing a fallback redirect back through the callback", () => {
      expect(
        buildAuthCallbackPath({
          code: "abc123",
          nextPath: "/workspace",
          fallbackPath: "/workspace",
        })
      ).toBe("/auth/callback?next=%2Fworkspace&code=abc123");
    });
  });

  describe("getAuthCodeRedirectTarget", () => {
    it("routes recovery codes to the update password page", () => {
      expect(getAuthCodeRedirectTarget("recovery")).toBe(
        "/auth/update-password"
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
