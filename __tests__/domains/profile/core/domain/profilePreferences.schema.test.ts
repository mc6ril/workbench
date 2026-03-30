import {
  DEFAULT_USER_PREFERENCES,
  isGettingStartedStatus,
  isThemePreference,
  resolveThemePreference,
} from "@/domains/profile/core/domain/profile.types";

describe("profile theme preferences", () => {
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

describe("profile getting started preferences", () => {
  it("recognizes supported getting-started status values", () => {
    expect(isGettingStartedStatus("pending")).toBe(true);
    expect(isGettingStartedStatus("skipped")).toBe(true);
    expect(isGettingStartedStatus("completed")).toBe(true);
    expect(isGettingStartedStatus("archived")).toBe(false);
  });

  it("defaults getting-started status to pending", () => {
    expect(DEFAULT_USER_PREFERENCES.gettingStartedStatus).toBe("pending");
  });
});
