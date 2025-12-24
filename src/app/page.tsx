"use client";

import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import type { CreateProjectInput } from "@/core/domain/project/project.schema";
import { CreateProjectInputSchema } from "@/core/domain/project/project.schema";

import Button from "@/presentation/components/ui/Button";
import Input from "@/presentation/components/ui/Input";
import { useAddUserToProject } from "@/presentation/hooks/useAddUserToProject";
import { useCreateProject } from "@/presentation/hooks/useCreateProject";
import { useProjects } from "@/presentation/hooks/useProjects";
import { useSession } from "@/presentation/hooks/useSession";

import { useTranslation } from "@/shared/i18n";

import styles from "./HomePage.module.scss";

type CreateProjectFormData = CreateProjectInput;

export default function Home() {
  const router = useRouter();
  const { data: session, isLoading: isLoadingSession } = useSession();
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects();
  const addUserToProjectMutation = useAddUserToProject();
  const createProjectMutation = useCreateProject();
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation("pages.home");
  const tCommon = useTranslation("common");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(CreateProjectInputSchema),
    mode: "onBlur",
  });

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

  useEffect(() => {
    if (createProjectMutation.error) {
      const error = createProjectMutation.error as {
        message?: string;
        code?: string;
      };

      // Map domain errors to form fields
      if (error.code === "CONSTRAINT_VIOLATION") {
        setFormError("name", {
          type: "server",
          message: error.message || t("errors.generic"),
        });
      } else {
        // General error - set on root
        setFormError("root", {
          type: "server",
          message: error.message || t("errors.generic"),
        });
      }
    }
  }, [createProjectMutation.error, setFormError, t]);

  useEffect(() => {
    if (createProjectMutation.isSuccess && createProjectMutation.data) {
      // Redirect to project page after successful creation
      router.push(`/projects/${createProjectMutation.data.id}`);
    }
  }, [createProjectMutation.isSuccess, createProjectMutation.data, router]);

  const onCreateProjectSubmit: SubmitHandler<CreateProjectFormData> = async (
    data
  ) => {
    createProjectMutation.mutate(data);
  };

  // Determine if user has no projects (for conditional rendering)
  // Only consider it as "no projects" if projects is defined and is an empty array
  // If projects is undefined, we're still loading or there's an error
  const hasNoProjects = Array.isArray(projects) && projects.length === 0;

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

        {hasNoProjects && (
          <section className={styles["home-section"]}>
            <h2 className={styles["home-section-title"]}>
              {t("createProjectTitle")}
            </h2>
            <p className={styles["home-section-description"]}>
              {t("createProjectDescription")}
            </p>
            <form
              onSubmit={handleSubmit(onCreateProjectSubmit)}
              className={styles["home-create-form"]}
              noValidate
            >
              {errors.root && (
                <div className={styles["home-error"]} role="alert">
                  {errors.root.message}
                </div>
              )}

              <Input
                label={t("projectNameLabel")}
                type="text"
                autoComplete="off"
                required
                error={errors.name?.message}
                placeholder={t("projectNamePlaceholder")}
                {...register("name")}
              />

              <Button
                label={t("createProjectButton")}
                type="submit"
                fullWidth
                disabled={createProjectMutation.isPending}
                aria-label={t("createProjectButtonAriaLabel")}
                onClick={() => {}}
              />
            </form>
          </section>
        )}

        {hasNoProjects && (
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
                disabled={
                  !projectId.trim() || addUserToProjectMutation.isPending
                }
                aria-label={t("accessProjectButton")}
              />
            </div>
          </section>
        )}

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
          ) : Array.isArray(projects) && projects.length > 0 ? (
            <ul className={styles["home-projects-list"]}>
              {projects.map((project) => {
                const roleLabel =
                  project.role === "admin"
                    ? t("roleAdmin")
                    : project.role === "member"
                      ? t("roleMember")
                      : t("roleViewer");
                return (
                  <li key={project.id} className={styles["home-project-item"]}>
                    <Link
                      href={`/projects/${project.id}`}
                      className={styles["home-project-link"]}
                      aria-label={`${project.name}, ${t("roleAriaLabel")}: ${roleLabel}`}
                    >
                      <span className={styles["home-project-name"]}>
                        {project.name}
                      </span>
                      <span className={styles["home-project-role"]}>
                        {roleLabel}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : Array.isArray(projects) && projects.length === 0 ? (
            <p className={styles["home-empty"]}>{t("noProjects")}</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
