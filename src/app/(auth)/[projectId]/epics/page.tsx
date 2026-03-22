"use client";

import { Suspense, use } from "react";

import Loader from "@/shared/design-system/loader";

import { PlanFeature } from "@/domains/billing/core/domain/planFeatures.rules";
import FeatureGate from "@/domains/billing/presentation/layouts/featureGate/FeatureGate";
import EpicsLayout from "@/modules/board/presentation/pages/epics";

const EpicsPageRouteContent = ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = use(params);

  return (
    <FeatureGate feature={PlanFeature.EPICS}>
      <EpicsLayout projectId={projectId} />
    </FeatureGate>
  );
};

const EpicsPage = ({ params }: { params: Promise<{ projectId: string }> }) => {
  return (
    <Suspense fallback={<Loader />}>
      <EpicsPageRouteContent params={params} />
    </Suspense>
  );
};

export default EpicsPage;
