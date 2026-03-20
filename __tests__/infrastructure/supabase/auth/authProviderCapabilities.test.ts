import {
  canUpdatePasswordFromAppMetadata,
  extractAuthProviders,
} from "@/domains/auth/infrastructure/supabase/authProviderCapabilities";

describe("authProviderCapabilities", () => {
  describe("extractAuthProviders", () => {
    it("returns providers array when available", () => {
      expect(
        extractAuthProviders({
          providers: ["google", "email"],
        })
      ).toEqual(["google", "email"]);
    });

    it("falls back to single provider", () => {
      expect(
        extractAuthProviders({
          provider: "google",
        })
      ).toEqual(["google"]);
    });

    it("returns an empty array for unknown metadata", () => {
      expect(extractAuthProviders(undefined)).toEqual([]);
    });
  });

  describe("canUpdatePasswordFromAppMetadata", () => {
    it("allows password updates when email provider is linked", () => {
      expect(
        canUpdatePasswordFromAppMetadata({
          providers: ["google", "email"],
        })
      ).toBe(true);
    });

    it("blocks password updates for oauth-only accounts", () => {
      expect(
        canUpdatePasswordFromAppMetadata({
          provider: "google",
        })
      ).toBe(false);
    });

    it("defaults to allowing password updates when provider metadata is missing", () => {
      expect(canUpdatePasswordFromAppMetadata(undefined)).toBe(true);
    });
  });
});
