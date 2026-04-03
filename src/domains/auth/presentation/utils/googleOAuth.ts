import { useSyncExternalStore } from "react";

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

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

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

export const isStandaloneDisplayMode = (): boolean => {
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    try {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        return true;
      }
    } catch {
      // Ignore matchMedia failures and fall back to navigator detection.
    }
  }

  if (typeof navigator === "undefined") {
    return false;
  }

  return (navigator as NavigatorWithStandalone).standalone === true;
};

export const isUnsupportedGoogleOAuthContext = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }

  return (
    isUnsupportedGoogleOAuthUserAgent(navigator.userAgent) ||
    isStandaloneDisplayMode()
  );
};

const subscribeToGoogleOAuthContext = (
  onStoreChange: () => void
): (() => void) => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(display-mode: standalone)");

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onStoreChange);
    return () => mediaQuery.removeEventListener("change", onStoreChange);
  }

  if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(onStoreChange);
    return () => mediaQuery.removeListener(onStoreChange);
  }

  return () => {};
};

export const useIsGoogleOAuthBlocked = (): boolean =>
  useSyncExternalStore(
    subscribeToGoogleOAuthContext,
    isUnsupportedGoogleOAuthContext,
    () => false
  );
