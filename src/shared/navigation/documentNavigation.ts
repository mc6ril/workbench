import { useNavigationFeedbackStore } from "@/shared/stores/useNavigationFeedbackStore";

/**
 * Performs a full document navigation. Use this when auth state changes and
 * middleware/server layouts must re-evaluate against fresh cookies.
 */
export const navigateToDocumentPath = (path: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  useNavigationFeedbackStore.getState().beginNavigation(path);
  window.location.assign(path);
};
