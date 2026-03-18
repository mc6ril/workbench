"use client";

import { Suspense, use } from "react";

import { PlanFeature } from "@/domains/project-management/core/domain/rules/planFeatures.rules";

import Loader from "@/shared/design-system/Loader";
import FeatureGate from "@/domains/project-management/presentation/layouts/featureGate/FeatureGate";
import EpicsLayout from "@/domains/project-management/presentation/pages/epics";

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
