import {
  APP_COOKIE_KEYS,
  getCookie,
  resetCookie,
  updateCookie,
} from "@/shared/infrastructure/storage/cookies";

describe("shared cookie helpers", () => {
  beforeEach(() => {
    resetCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES);
    resetCookie(APP_COOKIE_KEYS.LOCALE);
  });

  it("exposes the shared app cookie keys", () => {
    expect(APP_COOKIE_KEYS.LOCALE).toBe("workbench-locale");
    expect(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES).toBe(
      "workbench-runtime-config-overrides"
    );
  });

  it("reads a cookie from a raw cookie header", () => {
    expect(
      getCookie(
        APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES,
        `theme=dark; ${APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES}=enabled`
      )
    ).toBe("enabled");
  });

  it("reads a cookie from a cookie store like object", () => {
    expect(
      getCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES, {
        get: (name) =>
          name === APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES
            ? { value: "enabled" }
            : undefined,
      })
    ).toBe("enabled");
  });

  it("updates and resets browser cookies", () => {
    updateCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES, "enabled", {
      maxAgeSeconds: 60,
    });
    expect(getCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES)).toBe("enabled");

    resetCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES);
    expect(getCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES)).toBeUndefined();
  });
});
