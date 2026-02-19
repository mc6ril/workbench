"use client";

import { use } from "react";
import React from "react";

import { PlanFeature } from "@/core/domain/schema/planFeatures.schema";

import FeatureGate from "@/presentation/layouts/featureGate/FeatureGate";
import EpicsLayout from "@/presentation/pages/epics";

const EpicsPage = ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = use(params);

  return (
    <FeatureGate feature={PlanFeature.EPICS}>
      <EpicsLayout projectId={projectId} />
    </FeatureGate>
  );
};

export default EpicsPage;
