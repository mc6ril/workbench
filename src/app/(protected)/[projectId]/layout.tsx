import { Suspense } from "react";

import ProjectLoading from "@/app/(protected)/[projectId]/loading";
import ProjectRouteLayoutContent from "@/domains/project/presentation/layouts/projectRoute/ProjectRouteLayoutContent";

const ProjectRouteLayoutShell = async ({
  params,
  children,
}: {
  params: Promise<{ projectId: string }>;
  children: React.ReactNode;
}) => {
  const { projectId } = await params;
  return (
    <ProjectRouteLayoutContent projectId={projectId}>
      {children}
    </ProjectRouteLayoutContent>
  );
};

const ProjectLayout = ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}>) => {
  return (
    <Suspense fallback={<ProjectLoading />}>
      <ProjectRouteLayoutShell params={params}>
        {children}
      </ProjectRouteLayoutShell>
    </Suspense>
  );
};

export default ProjectLayout;
