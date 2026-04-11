import { create } from "zustand";

import {
  NAVIGATION_FEEDBACK_HARD_TIMEOUT_MS,
  NAVIGATION_FEEDBACK_MIN_VISIBLE_MS,
  NAVIGATION_FEEDBACK_SHOW_DELAY_MS,
} from "@/shared/navigation/navigationFeedback.constants";
import type {
  NavigationFeedbackCompletionMode,
  NavigationFeedbackStore,
} from "@/shared/navigation/navigationFeedback.types";
import {
  doesNavigationCompletionMatchTarget,
  normalizeNavigationHref,
} from "@/shared/navigation/navigationFeedback.utils";

let navigationSeq = 0;

let delayTimer: ReturnType<typeof setTimeout> | null = null;
let hardTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
let minVisibleTimer: ReturnType<typeof setTimeout> | null = null;

const clearAllTimers = (): void => {
  if (delayTimer) {
    clearTimeout(delayTimer);
    delayTimer = null;
  }
  if (hardTimeoutTimer) {
    clearTimeout(hardTimeoutTimer);
    hardTimeoutTimer = null;
  }
  if (minVisibleTimer) {
    clearTimeout(minVisibleTimer);
    minVisibleTimer = null;
  }
};

const initialState = {
  status: "idle" as const,
  currentNavigationId: 0,
  targetHref: "",
  completionMode: "route" as const,
  startedAt: null as number | null,
  visibleAt: null as number | null,
};

const transitionToIdle = (): void => {
  useNavigationFeedbackStore.setState({
    ...initialState,
  });
};

export const useNavigationFeedbackStore = create<NavigationFeedbackStore>(
  (set, get) => {
    const completeCurrentNavigation = (): void => {
      const state = get();

      if (state.status === "idle") {
        return;
      }

      const { currentNavigationId: id, status, visibleAt } = state;

      clearAllTimers();

      if (status === "delaying") {
        set({
          ...initialState,
        });
        return;
      }

      if (status === "visible" && visibleAt !== null) {
        const elapsed = Date.now() - visibleAt;
        const remaining = Math.max(0, NAVIGATION_FEEDBACK_MIN_VISIBLE_MS - elapsed);

        if (remaining === 0) {
          set({
            ...initialState,
          });
          return;
        }

        minVisibleTimer = setTimeout(() => {
          minVisibleTimer = null;
          const latest = get();
          if (latest.currentNavigationId !== id) {
            return;
          }
          set({
            ...initialState,
          });
        }, remaining);
      }
    };

    return {
      ...initialState,

      beginNavigation: (
        targetHref: string,
        options?: { completionMode?: NavigationFeedbackCompletionMode }
      ) => {
        const normalized = normalizeNavigationHref(targetHref);
        clearAllTimers();
        const id = ++navigationSeq;

        set({
          status: "delaying",
          currentNavigationId: id,
          targetHref: normalized,
          completionMode: options?.completionMode ?? "route",
          startedAt: Date.now(),
          visibleAt: null,
        });

        delayTimer = setTimeout(() => {
          delayTimer = null;
          set((state) => {
            if (state.currentNavigationId !== id) {
              return state;
            }
            return {
              ...state,
              status: "visible",
              visibleAt: Date.now(),
            };
          });
        }, NAVIGATION_FEEDBACK_SHOW_DELAY_MS);

        hardTimeoutTimer = setTimeout(() => {
          hardTimeoutTimer = null;
          const state = get();
          if (state.currentNavigationId !== id) {
            return;
          }
          clearAllTimers();
          transitionToIdle();
        }, NAVIGATION_FEEDBACK_HARD_TIMEOUT_MS);
      },

      completeNavigation: (resolvedHref: string) => {
        const normalized = normalizeNavigationHref(resolvedHref);
        const state = get();

        if (state.status === "idle") {
          return;
        }
        if (
          state.completionMode === "route" &&
          !doesNavigationCompletionMatchTarget(state.targetHref, normalized)
        ) {
          return;
        }

        completeCurrentNavigation();
      },

      cancelNavigation: () => {
        clearAllTimers();
        set({
          ...initialState,
        });
      },

      reset: () => {
        clearAllTimers();
        set({
          ...initialState,
        });
      },
    };
  }
);
