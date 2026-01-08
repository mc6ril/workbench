import { redirect } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { buildProjectRoute } from "@/shared/utils/routes";

/**
 * Project root page - redirects to board view.
 */
const ProjectPage = async ({
  params,
}: Readonly<{
  params: Promise<{ projectId: string }>;
}>) => {
  const { projectId } = await params;
  redirect(buildProjectRoute(projectId, PROJECT_VIEWS.BOARD));
};

export default ProjectPage;
