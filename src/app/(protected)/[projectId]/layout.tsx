import { Suspense } from "react";

import ProjectLoading from "@/app/(protected)/[projectId]/loading";
import ProjectRouteLayoutContent from "@/domains/project/presentation/layouts/projectRoute/ProjectRouteLayoutContent";

/**
 * Server-side layout for project routes.
 * Resolves minimal shell snapshot (access + enabled modules + recipes visibility flag).
 * Does not prefetch role, members, billing, or subscription.
 */
const ProjectLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}>) => {
  const { projectId } = await params;

  return (
    <Suspense fallback={<ProjectLoading />}>
      <ProjectRouteLayoutContent projectId={projectId}>
        {children}
      </ProjectRouteLayoutContent>
    </Suspense>
  );
};

export default ProjectLayout;
