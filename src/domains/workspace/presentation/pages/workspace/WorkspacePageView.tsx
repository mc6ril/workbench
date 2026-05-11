import ErrorMessage from "@/shared/design-system/error_message";
import Loader from "@/shared/design-system/loader";

import styles from "./styles.module.scss";

import type {
  ProjectWithStats,
  ReclaimableProject,
} from "@/domains/workspace/core/domain/workspace.types";
import ReclaimableProjectsSection from "@/domains/workspace/presentation/components/ReclaimableProjectsSection";
import WorkspaceEmptyState from "@/domains/workspace/presentation/components/WorkspaceEmptyState";
import WorkspaceFooter from "@/domains/workspace/presentation/components/WorkspaceFooter";
import WorkspaceHeader from "@/domains/workspace/presentation/components/WorkspaceHeader";
import WorkspaceProjectsSection from "@/domains/workspace/presentation/components/WorkspaceProjectsSection";

type WorkspacePageViewProps = {
  createWorkspaceModal: React.ReactNode;
  displayName?: string | null;
  formatLastActivity: (
    updatedAt: Date | undefined,
    referenceDate?: Date
  ) => string;
  legal: string;
  onCreateWorkspace: () => void;
  onOpenProject: (projectId: string) => void;
  onReclaimProject: (projectId: string) => void | Promise<void>;
  projects?: ProjectWithStats[];
  projectsErrorMessage: string | null;
  reclaimableProjects?: ReclaimableProject[];
  reclaimingProjectId: string | null;
  referenceTime: Date;
  showProjectsListPlaceholder: boolean;
  showProjectsRefreshLoader: boolean;
};

const WorkspacePageView = ({
  createWorkspaceModal,
  displayName,
  formatLastActivity,
  legal,
  onCreateWorkspace,
  onOpenProject,
  onReclaimProject,
  projects,
  projectsErrorMessage,
  reclaimableProjects,
  reclaimingProjectId,
  referenceTime,
  showProjectsListPlaceholder,
  showProjectsRefreshLoader,
}: WorkspacePageViewProps) => {
  const hasProjects = Array.isArray(projects) && projects.length > 0;

  return (
    <main className={styles["workspace-page"]}>
      <WorkspaceHeader
        displayName={displayName}
        onCreateWorkspace={onCreateWorkspace}
      />

      <div className={styles["workspace-container"]}>
        {projectsErrorMessage && (
          <ErrorMessage message={projectsErrorMessage} />
        )}

        {Array.isArray(reclaimableProjects) &&
          reclaimableProjects.length > 0 && (
            <ReclaimableProjectsSection
              projects={reclaimableProjects}
              referenceTime={referenceTime}
              reclaimingProjectId={reclaimingProjectId}
              onReclaimProject={onReclaimProject}
            />
          )}

        {showProjectsListPlaceholder ? (
          <section className={styles["workspace-loader"]} aria-busy="true">
            <Loader variant="inline" />
          </section>
        ) : showProjectsRefreshLoader && hasProjects ? (
          <Loader variant="inline" />
        ) : hasProjects ? (
          <WorkspaceProjectsSection
            projects={projects}
            referenceTime={referenceTime}
            formatLastActivity={formatLastActivity}
            onOpenProject={onOpenProject}
          />
        ) : Array.isArray(projects) && projects.length === 0 ? (
          <WorkspaceEmptyState onCreateWorkspace={onCreateWorkspace} />
        ) : null}
      </div>

      <WorkspaceFooter legal={legal} />

      {createWorkspaceModal}
    </main>
  );
};

export default WorkspacePageView;
