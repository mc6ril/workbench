"use client";

import { Suspense, use } from "react";

import Loader from "@/shared/design-system/loader";

import ProjectSettingsPage from "@/domains/project/presentation/pages/settings/ProjectSettingsPage";

const ProjectSettingsRouteContent = ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = use(params);

  return <ProjectSettingsPage projectId={projectId} />;
};

const SettingsPage = ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  return (
    <Suspense fallback={<Loader />}>
      <ProjectSettingsRouteContent params={params} />
    </Suspense>
  );
};

export default SettingsPage;
