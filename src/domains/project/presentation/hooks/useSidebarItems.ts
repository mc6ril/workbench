import { useMemo } from "react";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslations } from "@/shared/i18n";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { getEffectivePlan } from "@/domains/billing/core/domain/planFeatures.rules";
import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";
import { useBillingVisibility } from "@/domains/billing/presentation/hooks/useBillingVisibility";
import { useSubscription } from "@/domains/billing/presentation/hooks/useSubscription";
import type { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import type { SidebarItem } from "@/domains/project/presentation/components/sidebarNavigation/SidebarNavigation.types";
import {
  buildProjectViewHref,
  getProjectViewConfigsForSidebar,
  getProjectViewFeatureLockState,
  isProjectViewModuleEnabled,
} from "@/domains/project/presentation/navigation/projectViews.config";

export type UseSidebarItemsOptions = {
  enabledModules: readonly ProjectModuleKey[];
  isRecipesBoardVisible: boolean;
};

export const useSidebarItems = (
  projectId: string,
  options: UseSidebarItemsOptions
): SidebarItem[] => {
  const t = useTranslations("navigation.sidebar");
  const { data: identity, isLoading: isIdentityLoading } = useAuthIdentity();
  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
    isFetched: isSubscriptionFetched,
  } = useSubscription();
  const { data: isBillingVisible } = useBillingVisibility();

  const { enabledModules, isRecipesBoardVisible } = options;

  const isEntitlementsReady = useMemo((): boolean => {
    if (isIdentityLoading) {
      return false;
    }

    if (!identity) {
      return true;
    }

    if (isSubscriptionLoading) {
      return false;
    }

    return isSubscriptionFetched;
  }, [
    identity,
    isIdentityLoading,
    isSubscriptionFetched,
    isSubscriptionLoading,
  ]);

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
      if (config.key === PROJECT_VIEWS.RECIPES && !isRecipesBoardVisible) {
        return [];
      }

      const enabled = isProjectViewModuleEnabled(config.key, enabledModules);

      if (!isEntitlementsReady || effectivePlan === null) {
        return [
          {
            key: config.key,
            href: buildProjectViewHref(projectId, config.key),
            label: t(`items.${config.sidebarLabelKey}`),
            exactOnly: false,
            enabled,
            locked: false,
            planBadge: undefined,
          },
        ];
      }

      const { locked, minimumPlan } = getProjectViewFeatureLockState(
        config.key,
        effectivePlan
      );

      if (isBillingVisible === false && locked) {
        return [];
      }

      return [
        {
          key: config.key,
          href: buildProjectViewHref(projectId, config.key),
          label: t(`items.${config.sidebarLabelKey}`),
          exactOnly: false,
          enabled,
          locked,
          planBadge: minimumPlan ? t(`locked.badge.${minimumPlan}`) : undefined,
        },
      ];
    });
  }, [
    effectivePlan,
    enabledModules,
    isBillingVisible,
    isEntitlementsReady,
    isRecipesBoardVisible,
    projectId,
    t,
  ]);
};
