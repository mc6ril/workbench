"use client";

import { Suspense, use } from "react";

import { PlanFeature } from "@/core/domain/rules/planFeatures.rules";

import Loader from "@/presentation/components/ui/Loader";
import FeatureGate from "@/presentation/layouts/featureGate/FeatureGate";
import EpicsLayout from "@/presentation/pages/epics";

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
