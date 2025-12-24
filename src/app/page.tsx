"use client";

import { useState } from "react";
import Link from "next/link";

import Button from "@/presentation/components/ui/Button";
import Input from "@/presentation/components/ui/Input";
import { useAddUserToProject } from "@/presentation/hooks/useAddUserToProject";
import { useProjects } from "@/presentation/hooks/useProjects";
import { useSession } from "@/presentation/hooks/useSession";

import { useTranslation } from "@/shared/i18n";

import styles from "./HomePage.module.scss";

export default function Home() {
  const { data: session, isLoading: isLoadingSession } = useSession();
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects();
  const addUserToProjectMutation = useAddUserToProject();
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation("pages.home");
  const tCommon = useTranslation("common");

  const handleAccessProject = async () => {
    if (!projectId.trim()) {
      setError(t("pleaseEnterProjectId"));
      return;
    }

    setError(null);

    try {
      await addUserToProjectMutation.mutateAsync({
        projectId: projectId.trim(),
      });
      // Clear the input on success
      setProjectId("");
      // Manually refetch projects to ensure UI updates
      await refetchProjects();
    } catch (err) {
      // Error handling is done by the mutation
      const errorMessage =
        (err as { message?: string })?.message || t("failedToAddToProject");
      setError(errorMessage);
    }
  };

  // If not authenticated, show signin/signup links
  if (!isLoadingSession && !session) {
    return (
      <main className={styles["home-page"]}>
        <div className={styles["home-container"]}>
          <h1 className={styles["home-title"]}>{t("welcome")}</h1>
          <p className={styles["home-subtitle"]}>{t("welcomeSubtitle")}</p>
          <div className={styles["home-actions"]}>
            <Link href="/signin">
              <Button label={tCommon("signIn")} onClick={() => {}} />
            </Link>
            <Link href="/signup">
              <Button
                label={tCommon("signUp")}
                variant="secondary"
                onClick={() => {}}
              />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Loading state
  if (isLoadingSession) {
    return (
      <main className={styles["home-page"]}>
        <div className={styles["home-container"]}>
          <p>{t("loading")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles["home-page"]}>
      <div className={styles["home-container"]}>
        <div className={styles["home-header"]}>
          <h1 className={styles["home-title"]}>{t("welcomeTitle")}</h1>
          {session && (
            <p className={styles["home-user-info"]}>
              {t("signedInAs")} <strong>{session.email}</strong>
            </p>
          )}
        </div>

        <section className={styles["home-section"]}>
          <h2 className={styles["home-section-title"]}>
            {t("accessProjectTitle")}
          </h2>
          <p className={styles["home-section-description"]}>
            {t("accessProjectDescription")}
          </p>
          <div className={styles["home-access-form"]}>
            <Input
              label={t("projectIdLabel")}
              type="text"
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setError(null);
              }}
              error={error || undefined}
              placeholder={t("projectIdPlaceholder")}
            />
            <Button
              label={t("accessProjectButton")}
              onClick={handleAccessProject}
              disabled={!projectId.trim() || addUserToProjectMutation.isPending}
            />
          </div>
        </section>

        <section className={styles["home-section"]}>
          <h2 className={styles["home-section-title"]}>
            {t("yourProjectsTitle")}
          </h2>
          {projectsError && (
            <p className={styles["home-error"]} role="alert">
              {t("errorLoadingProjects")}{" "}
              {(projectsError as { message?: string })?.message ||
                t("unknownError")}
            </p>
          )}
          {isLoadingProjects || addUserToProjectMutation.isPending ? (
            <p className={styles["home-loading"]}>{t("loadingProjects")}</p>
          ) : projects && projects.length > 0 ? (
            <ul className={styles["home-projects-list"]}>
              {projects.map((project) => (
                <li key={project.id} className={styles["home-project-item"]}>
                  <Link
                    href={`/projects/${project.id}`}
                    className={styles["home-project-link"]}
                  >
                    {project.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles["home-empty"]}>{t("noProjects")}</p>
          )}
        </section>
      </div>
    </main>
  );
}
