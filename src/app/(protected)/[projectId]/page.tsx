import { redirect } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";

/**
 * Project root page.
 * This route redirects to the board view to keep a single default flow.
 */
const ProjectPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;
  redirect(`/${projectId}/${PROJECT_VIEWS.BOARD}`);
};

export default ProjectPage;
