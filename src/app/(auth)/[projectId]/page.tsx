import ProjectHeader from "@/presentation/components/projectHeader/ProjectHeader";
import Container from "@/presentation/components/ui/Container";
import Stack from "@/presentation/components/ui/Stack";

import { getProjectForRoute } from "./getProjectForRoute";
import styles from "./ProjectPage.module.scss";

/**
 * Project root page (Home).
 * This route is the landing dashboard for a single project.
 */
const ProjectPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;
  const project = await getProjectForRoute(projectId);

  return (
    <div className={styles["project-page"]}>
      <Container maxWidth="large" className={styles["project-page__container"]}>
        <Stack spacing="xl">
          <ProjectHeader
            name={project.name}
            updatedAtIso={project.updatedAt.toISOString()}
          />
        </Stack>
      </Container>
    </div>
  );
};

export default ProjectPage;
