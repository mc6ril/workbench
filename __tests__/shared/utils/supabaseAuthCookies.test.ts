import {
  getCookieNames,
  hasSupabaseAuthCookie,
  hasSupabaseAuthCookieInHeader,
  isSupabaseAuthCookieName,
} from "@/shared/utils/supabaseAuthCookies";

describe("supabaseAuthCookies", () => {
  describe("isSupabaseAuthCookieName", () => {
    it("detects standard Supabase auth cookies", () => {
      expect(isSupabaseAuthCookieName("sb-projectref-auth-token")).toBe(true);
    });

    it("detects secure chunked Supabase auth cookies", () => {
      expect(
        isSupabaseAuthCookieName("__Secure-sb-projectref-auth-token.0")
      ).toBe(true);
    });

    it("ignores non-auth Supabase cookies", () => {
      expect(
        isSupabaseAuthCookieName("sb-projectref-auth-token-code-verifier")
      ).toBe(false);
      expect(isSupabaseAuthCookieName("sb-projectref-code-verifier")).toBe(
        false
      );
    });
  });

  describe("getCookieNames", () => {
    it("extracts cookie names from a cookie header", () => {
      expect(
        getCookieNames(
          "theme=light; sb-projectref-auth-token=session; locale=fr"
        )
      ).toEqual(["theme", "sb-projectref-auth-token", "locale"]);
    });
  });

  describe("hasSupabaseAuthCookie", () => {
    it("returns true when an auth cookie is present", () => {
      expect(
        hasSupabaseAuthCookie([
          "theme",
          "__Host-sb-projectref-auth-token.1",
          "locale",
        ])
      ).toBe(true);
    });

    it("returns false when no auth cookie is present", () => {
      expect(hasSupabaseAuthCookie(["theme", "locale"])).toBe(false);
    });
  });

  describe("hasSupabaseAuthCookieInHeader", () => {
    it("detects auth cookies from a raw header string", () => {
      expect(
        hasSupabaseAuthCookieInHeader(
          "theme=light; __Secure-sb-projectref-auth-token.0=abc"
        )
      ).toBe(true);
    });
  });
});
