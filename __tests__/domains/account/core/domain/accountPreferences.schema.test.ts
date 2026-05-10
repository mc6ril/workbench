import {
  isThemePreference,
  resolveThemePreference,
} from "@/shared/theme/config";

describe("account theme preferences", () => {
  it("recognizes supported theme values", () => {
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("sepia")).toBe(false);
  });

  it("falls back to system for unknown theme values", () => {
    expect(resolveThemePreference("dark")).toBe("dark");
    expect(resolveThemePreference("sepia")).toBe("system");
    expect(resolveThemePreference(undefined)).toBe("system");
  });
});
