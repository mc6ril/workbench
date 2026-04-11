import type { MouseEvent } from "react";

import { normalizeNavigationHref } from "@/shared/navigation/navigationFeedback.utils";

type LinkLikeOptions = {
  external?: boolean;
  target?: string | undefined;
};

/**
 * Returns true when a primary click on an internal app link should start
 * global navigation feedback (slow navigation overlay).
 */
export const shouldAnnounceNavigationFeedbackOnLinkClick = (
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  options: LinkLikeOptions
): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  if (options.external) {
    return false;
  }

  if (event.defaultPrevented) {
    return false;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  if (event.button !== 0) {
    return false;
  }

  if (options.target === "_blank") {
    return false;
  }

  const hrefTrim = href.trim();
  if (!hrefTrim) {
    return false;
  }

  if (hrefTrim.startsWith("#")) {
    return false;
  }

  if (/^(mailto:|tel:|sms:)/i.test(hrefTrim)) {
    return false;
  }

  try {
    const url = new URL(hrefTrim, window.location.href);
    if (url.origin !== window.location.origin) {
      return false;
    }

    const dest = normalizeNavigationHref(
      `${url.pathname}${url.search}`,
      window.location.origin
    );
    const current = normalizeNavigationHref(
      `${window.location.pathname}${window.location.search}`,
      window.location.origin
    );

    if (dest === current) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};
