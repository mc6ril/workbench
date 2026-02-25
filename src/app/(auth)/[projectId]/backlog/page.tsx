"use client";

import { use } from "react";

import BacklogPageContent from "@/presentation/pages/backlog";

const ProjectBacklogPage = ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = use(params);

  return <BacklogPageContent projectId={projectId} />;
};

export default ProjectBacklogPage;
