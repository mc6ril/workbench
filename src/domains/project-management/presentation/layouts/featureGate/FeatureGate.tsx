"use client";

import React from "react";

import type { PlanFeature } from "@/domains/project-management/core/domain/rules/planFeatures.rules";

import UpgradePrompt from "@/domains/project-management/presentation/components/upgradePrompt/UpgradePrompt";
import { useFeatureAccess } from "@/presentation/hooks/subscription/useFeatureAccess";

type Props = {
  feature: PlanFeature;
  children: React.ReactNode;
};

/**
 * Gate layout that renders children only if the current subscription
 * grants access to the specified feature. Shows an UpgradePrompt otherwise.
 * While loading, renders children optimistically to avoid layout flash.
 */
const FeatureGate = ({ feature, children }: Props) => {
  const { hasAccess, minimumPlan, isLoading } = useFeatureAccess(feature);

  if (isLoading) {
    return <>{children}</>;
  }

  if (!hasAccess) {
    return <UpgradePrompt feature={feature} minimumPlan={minimumPlan} />;
  }

  return <>{children}</>;
};

export default React.memo(FeatureGate);
