"use client";

import { use } from "react";

import { PlanFeature } from "@/core/domain/rules/planFeatures.rules";

import FeatureGate from "@/presentation/layouts/featureGate/FeatureGate";
import BacklogPageContent from "@/presentation/pages/backlog";

const ProjectBacklogPage = ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = use(params);

  return (
    <FeatureGate feature={PlanFeature.BACKLOG_VIEW}>
      <BacklogPageContent projectId={projectId} />
    </FeatureGate>
  );
};

export default ProjectBacklogPage;
