import ProjectHeader from "@/presentation/components/projectHeader/ProjectHeader";
import ProjectHomeDashboard from "@/presentation/components/projectHomeDashboard/ProjectHomeDashboard";

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
    <main className={styles["project-page"]}>
      <div className={styles["project-page__header"]}>
        <div className={styles["project-page__header-content"]}>
          <ProjectHeader
            projectId={projectId}
            name={project.name}
            fallbackUpdatedAtIso={project.updatedAt.toISOString()}
          />
        </div>
      </div>
      <div className={styles["project-page__container"]}>
        <ProjectHomeDashboard projectId={projectId} />
      </div>
    </main>
  );
};

export default ProjectPage;
