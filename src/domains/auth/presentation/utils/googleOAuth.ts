const BLOCKED_GOOGLE_OAUTH_USER_AGENT_PATTERNS: readonly RegExp[] =
  Object.freeze([
    /\bFBAN\b/i,
    /\bFBAV\b/i,
    /\bFB_IAB\b/i,
    /Instagram/i,
    /Line\//i,
    /MicroMessenger/i,
    /LinkedInApp/i,
    /TikTok/i,
    /Snapchat/i,
    /; wv\)/i,
    /\bWebView\b/i,
  ]);

/**
 * Google blocks OAuth inside some embedded or in-app browsers.
 * We keep the heuristic intentionally conservative to avoid false positives
 * on regular Chrome, Safari, or Firefox tabs.
 */
export const isUnsupportedGoogleOAuthUserAgent = (
  userAgent?: string | null
): boolean => {
  if (!userAgent) {
    return false;
  }

  return BLOCKED_GOOGLE_OAUTH_USER_AGENT_PATTERNS.some((pattern) =>
    pattern.test(userAgent)
  );
};

export const isUnsupportedGoogleOAuthContext = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }

  return isUnsupportedGoogleOAuthUserAgent(navigator.userAgent);
};
