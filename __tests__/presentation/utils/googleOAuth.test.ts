import {
  isUnsupportedGoogleOAuthContext,
  isUnsupportedGoogleOAuthUserAgent,
} from "@/domains/auth/presentation/utils/googleOAuth";

describe("isUnsupportedGoogleOAuthUserAgent", () => {
  it("returns false for a standard desktop Chrome user agent", () => {
    expect(
      isUnsupportedGoogleOAuthUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/134.0.0.0 Safari/537.36"
      )
    ).toBe(false);
  });

  it("returns true for Instagram in-app browser user agents", () => {
    expect(
      isUnsupportedGoogleOAuthUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) " +
          "AppleWebKit/605.1.15 (KHTML, like Gecko) " +
          "Mobile/15E148 Instagram 372.0.0.0.44"
      )
    ).toBe(true);
  });

  it("returns true for Android WebView user agents", () => {
    expect(
      isUnsupportedGoogleOAuthUserAgent(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro Build/UP1A.231005.007; wv) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Version/4.0 Chrome/125.0.0.0 Mobile Safari/537.36"
      )
    ).toBe(true);
  });
});

describe("isUnsupportedGoogleOAuthContext", () => {
  const originalUserAgent = window.navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
  });

  it("uses the current browser user agent", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) " +
        "AppleWebKit/605.1.15 (KHTML, like Gecko) " +
        "Mobile/15E148 Instagram 372.0.0.0.44",
    });

    expect(isUnsupportedGoogleOAuthContext()).toBe(true);
  });
});
