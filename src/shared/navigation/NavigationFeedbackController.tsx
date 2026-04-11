"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import NavigationPendingOverlay from "@/shared/design-system/navigation_pending_overlay";
import { normalizeNavigationHref } from "@/shared/navigation/navigationFeedback.utils";
import { useNavigationFeedbackStore } from "@/shared/stores/useNavigationFeedbackStore";

const NavigationRouteSync = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const completeNavigation = useNavigationFeedbackStore(
    (s) => s.completeNavigation
  );

  const searchString = searchParams.toString();
  const currentHref = searchString
    ? `${pathname}?${searchString}`
    : pathname;

  useEffect(() => {
    // Run after every router-driven render so refresh/back/forward feedback can
    // complete even when the resolved URL string stays unchanged.
    const normalized = normalizeNavigationHref(currentHref);
    completeNavigation(normalized);
  });

  return null;
};

const PopStateListener = () => {
  useEffect(() => {
    const onPopState = () => {
      const href = `${window.location.pathname}${window.location.search}`;
      const store = useNavigationFeedbackStore.getState();
      if (store.status !== "idle") {
        return;
      }
      store.beginNavigation(href);
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return null;
};

/**
 * Global navigation feedback: syncs route changes to the store and renders the overlay.
 * Mount once under {@link AppProvider}.
 */
const NavigationFeedbackController = () => {
  return (
    <>
      <PopStateListener />
      <Suspense fallback={null}>
        <NavigationRouteSync />
      </Suspense>
      <NavigationPendingOverlay />
    </>
  );
};

export default NavigationFeedbackController;
