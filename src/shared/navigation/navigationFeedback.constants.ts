/** Delay before showing the global overlay (avoids flicker on fast navigations). */
export const NAVIGATION_FEEDBACK_SHOW_DELAY_MS = 120;

/** Minimum time the overlay stays visible once shown (avoids flashes). */
export const NAVIGATION_FEEDBACK_MIN_VISIBLE_MS = 180;

/** Safety cap: force-reset stuck navigation feedback. */
export const NAVIGATION_FEEDBACK_HARD_TIMEOUT_MS = 10000;
