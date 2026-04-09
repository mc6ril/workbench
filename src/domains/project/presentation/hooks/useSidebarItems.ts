import { useMemo } from "react";

import { useTranslations } from "@/shared/i18n";

import {
  canAccessFeature,
  getEffectivePlan,
  getMinimumPlanForFeature,
  type PlanFeature,
} from "@/domains/billing/core/domain/planFeatures.rules";
import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";
import { useBillingVisibility } from "@/domains/billing/presentation/hooks/useBillingVisibility";
import { useSubscription } from "@/domains/billing/presentation/hooks/useSubscription";
import type { SidebarItem } from "@/domains/project/presentation/components/sidebarNavigation/SidebarNavigation.types";
import {
  buildProjectViewHref,
  getProjectViewConfigsForSidebar,
} from "@/domains/project/presentation/navigation/projectViews.config";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

type FeatureLockState = {
  locked: boolean;
  minimumPlan?: SubscriptionPlan;
};

const computeFeatureLockState = (
  requiredFeature: PlanFeature | undefined,
  effectivePlan: SubscriptionPlan
): FeatureLockState => {
  if (!requiredFeature) {
    return { locked: false };
  }

  if (canAccessFeature(effectivePlan, requiredFeature)) {
    return { locked: false };
  }

  return {
    locked: true,
    minimumPlan: getMinimumPlanForFeature(requiredFeature),
  };
};

export const useSidebarItems = (projectId: string): SidebarItem[] => {
  const t = useTranslations("navigation.sidebar");
  const { data: session, isLoading: isSessionLoading } = useSession();
  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
    isFetched: isSubscriptionFetched,
  } = useSubscription();
  const { data: isBillingVisible } = useBillingVisibility();

  const isEntitlementsReady = useMemo((): boolean => {
    if (isSessionLoading) {
      return false;
    }

    if (!session) {
      return true;
    }

    if (isSubscriptionLoading) {
      return false;
    }

    return isSubscriptionFetched;
  }, [isSessionLoading, isSubscriptionFetched, isSubscriptionLoading, session]);

  const effectivePlan = useMemo((): SubscriptionPlan | null => {
    if (!isEntitlementsReady) {
      return null;
    }

    if (!subscription) {
      return SubscriptionPlan.FREE;
    }

    return getEffectivePlan(subscription);
  }, [isEntitlementsReady, subscription]);

  return useMemo((): SidebarItem[] => {
    const configs = getProjectViewConfigsForSidebar();

    return configs.flatMap((config) => {
      const { locked, minimumPlan } =
        effectivePlan === null
          ? { locked: false, minimumPlan: undefined }
          : computeFeatureLockState(config.requiredFeature, effectivePlan);

      if (!isBillingVisible && locked) {
        return [];
      }

      return [
        {
          key: config.key,
          href: buildProjectViewHref(projectId, config.key),
          label: t(`items.${config.sidebarLabelKey}`),
          exactOnly: false,
          locked,
          planBadge: minimumPlan ? t(`locked.badge.${minimumPlan}`) : undefined,
        },
      ];
    });
  }, [effectivePlan, isBillingVisible, projectId, t]);
};
