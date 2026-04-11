export type NavigationFeedbackStatus = "idle" | "delaying" | "visible";
export type NavigationFeedbackCompletionMode = "route" | "render";

export type NavigationFeedbackState = {
  status: NavigationFeedbackStatus;
  currentNavigationId: number;
  targetHref: string;
  completionMode: NavigationFeedbackCompletionMode;
  startedAt: number | null;
  visibleAt: number | null;
};

export type NavigationFeedbackActions = {
  beginNavigation: (
    targetHref: string,
    options?: { completionMode?: NavigationFeedbackCompletionMode }
  ) => void;
  completeNavigation: (resolvedHref: string) => void;
  cancelNavigation: () => void;
  reset: () => void;
};

export type NavigationFeedbackStore = NavigationFeedbackState &
  NavigationFeedbackActions;
