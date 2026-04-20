"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentLocationHrefNormalized,
  normalizeNavigationHref,
} from "@/shared/navigation/navigationFeedback.utils";
import { useNavigationFeedbackStore } from "@/shared/stores/useNavigationFeedbackStore";

export type AppRouterNavigationOptions = {
  feedback?: "auto" | "none";
};

type NextNavigateOptions = {
  scroll?: boolean;
};

type AppRouterFeedbackOnlyOptions = AppRouterNavigationOptions;

const omitFeedback = <
  T extends { feedback?: AppRouterNavigationOptions["feedback"] },
>(
  options: T | undefined
): Omit<T, "feedback"> | undefined => {
  if (!options) {
    return undefined;
  }
  const { feedback: _f, ...rest } = options;
  return rest as Omit<T, "feedback">;
};

const shouldBeginAutoFeedback = (
  href: string,
  feedback: NonNullable<AppRouterNavigationOptions["feedback"]>
): boolean => {
  if (feedback === "none") {
    return false;
  }
  const next = normalizeNavigationHref(href);
  const current = getCurrentLocationHrefNormalized();
  return next !== current;
};

/**
 * App-wide router with optional navigation feedback for client navigations.
 * Prefer this over `useRouter` from `next/navigation` in presentation code (see ESLint).
 */
export const useAppRouter = () => {
  const router = useRouter();
  const beginCurrentRouteFeedback = useCallback(
    (options?: AppRouterFeedbackOnlyOptions) => {
      const feedback = options?.feedback ?? "auto";
      if (feedback === "none") {
        return;
      }

      const currentHref = getCurrentLocationHrefNormalized();
      useNavigationFeedbackStore
        .getState()
        .beginNavigation(currentHref || "/", { completionMode: "render" });
    },
    []
  );

  const push = useCallback(
    (
      href: string,
      options?: NextNavigateOptions & AppRouterNavigationOptions
    ) => {
      const feedback = options?.feedback ?? "auto";
      const nextOpts = omitFeedback(options);
      if (shouldBeginAutoFeedback(href, feedback)) {
        useNavigationFeedbackStore.getState().beginNavigation(href);
      }
      if (nextOpts === undefined) {
        return router.push(href);
      }
      return router.push(href, nextOpts);
    },
    [router]
  );

  const replace = useCallback(
    (
      href: string,
      options?: NextNavigateOptions & AppRouterNavigationOptions
    ) => {
      const feedback = options?.feedback ?? "auto";
      const nextOpts = omitFeedback(options);
      if (shouldBeginAutoFeedback(href, feedback)) {
        useNavigationFeedbackStore.getState().beginNavigation(href);
      }
      if (nextOpts === undefined) {
        return router.replace(href);
      }
      return router.replace(href, nextOpts);
    },
    [router]
  );

  const back = useCallback(
    (options?: AppRouterFeedbackOnlyOptions) => {
      beginCurrentRouteFeedback(options);
      return router.back();
    },
    [beginCurrentRouteFeedback, router]
  );

  const forward = useCallback(
    (options?: AppRouterFeedbackOnlyOptions) => {
      beginCurrentRouteFeedback(options);
      return router.forward();
    },
    [beginCurrentRouteFeedback, router]
  );

  const refresh = useCallback(
    (options?: AppRouterFeedbackOnlyOptions) => {
      beginCurrentRouteFeedback(options);
      return router.refresh();
    },
    [beginCurrentRouteFeedback, router]
  );

  return useMemo(
    () => ({
      back,
      forward,
      prefetch: router.prefetch,
      push,
      refresh,
      replace,
    }),
    [back, forward, push, refresh, replace, router]
  );
};
