"use client";

import { useEffect, useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import type { CreateProjectInput } from "@/core/domain/project.schema";
import { CreateProjectInputSchema } from "@/core/domain/project.schema";

import Button from "@/presentation/components/ui/Button";
import Input from "@/presentation/components/ui/Input";
import Loader from "@/presentation/components/ui/Loader";
import {
  useAddUserToProject,
  useCreateProject,
  useDeleteUser,
  useProjects,
  useSession,
  useSignOut,
  useUpdateUser,
} from "@/presentation/hooks";

import { useTranslation } from "@/shared/i18n";

import styles from "./HomePage.module.scss";

type CreateProjectFormData = CreateProjectInput;

export default function MyWorkspace() {
  const router = useRouter();
  const { data: session, isLoading: isLoadingSession } = useSession();
  const {
    data: projects,
    isLoading: isLoadingProjects,
    isFetching: isFetchingProjects,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects();
  const addUserToProjectMutation = useAddUserToProject();
  const createProjectMutation = useCreateProject();
  const signOutMutation = useSignOut();
  const deleteUserMutation = useDeleteUser();
  const updateUserMutation = useUpdateUser();
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showUpdateUserForm, setShowUpdateUserForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const isSubmittingRef = useRef(false);
  const t = useTranslation("pages.home");

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
      // Reset submitting ref
      isSubmittingRef.current = false;
      // Redirect to project page after successful creation
      router.push(`/projects/${createProjectMutation.data.id}`);
    }
  }, [createProjectMutation.isSuccess, createProjectMutation.data, router]);

  useEffect(() => {
    if (createProjectMutation.error) {
      // Reset submitting ref on error
      isSubmittingRef.current = false;
    }
  }, [createProjectMutation.error]);

  const onCreateProjectSubmit: SubmitHandler<CreateProjectFormData> = async (
    data
  ) => {
    // Prevent duplicate submissions using ref (faster than isPending)
    if (isSubmittingRef.current || createProjectMutation.isPending) {
      return;
    }

    isSubmittingRef.current = true;
    try {
      await createProjectMutation.mutateAsync(data);
    } finally {
      // Reset after a short delay to allow mutation state to update
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 100);
    }
  };

  // Determine if user has projects (for conditional rendering)
  // Only consider it as "has projects" if projects is defined and is a non-empty array
  // If projects is undefined, we're still loading or there's an error
  const hasProjects = Array.isArray(projects) && projects.length > 0;

  // Loading state - wait for both session and projects to load
  // Also wait if projects is undefined (initial state before first fetch completes)
  // Wait for both isLoadingProjects AND isFetchingProjects to be false to avoid rendering during refetches
  // Only render content when we have a definitive answer: projects is an array (empty or not) or there's an error
  const isInitialLoad =
    isLoadingSession ||
    isLoadingProjects ||
    isFetchingProjects ||
    projects === undefined;

  if (isInitialLoad) {
    return (
      <main className={styles["home-page"]}>
        <Loader variant="full-page" />
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
          <div className={styles["home-user-actions"]}>
            <Button
              label={t("logoutButton")}
              onClick={() => signOutMutation.mutate()}
              disabled={signOutMutation.isPending}
              variant="secondary"
              aria-label={t("logoutButtonAriaLabel")}
            />
            <Button
              label={t("updateUserButton")}
              onClick={() => {
                setShowUpdateUserForm(true);
                setNewEmail(session?.email || "");
                setNewPassword("");
              }}
              disabled={updateUserMutation.isPending}
              variant="secondary"
              aria-label={t("updateUserButtonAriaLabel")}
            />
            <Button
              label={t("deleteUserButton")}
              onClick={() => {
                if (
                  window.confirm(t("deleteUserConfirmation") || "Are you sure?")
                ) {
                  deleteUserMutation.mutate();
                }
              }}
              disabled={deleteUserMutation.isPending}
              variant="secondary"
              aria-label={t("deleteUserButtonAriaLabel")}
            />
          </div>
          {showUpdateUserForm && (
            <div className={styles["home-update-user-form"]}>
              <Input
                label={t("newEmailLabel")}
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={t("newEmailPlaceholder")}
              />
              <Input
                label={t("newPasswordLabel")}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("newPasswordPlaceholder")}
                autoComplete="new-password"
              />
              <div className={styles["home-update-user-actions"]}>
                <Button
                  label={t("saveButton")}
                  onClick={() => {
                    const updateData: {
                      email?: string;
                      password?: string;
                    } = {};

                    if (newEmail && newEmail !== session?.email) {
                      updateData.email = newEmail;
                    }

                    if (newPassword) {
                      updateData.password = newPassword;
                    }

                    if (Object.keys(updateData).length > 0) {
                      updateUserMutation.mutate(updateData, {
                        onSuccess: () => {
                          setShowUpdateUserForm(false);
                          setNewEmail("");
                          setNewPassword("");
                        },
                      });
                    }
                  }}
                  disabled={
                    updateUserMutation.isPending ||
                    ((!newEmail || newEmail === session?.email) && !newPassword)
                  }
                  aria-label={t("saveButtonAriaLabel")}
                />
                <Button
                  label={t("cancelButton")}
                  onClick={() => {
                    setShowUpdateUserForm(false);
                    setNewEmail("");
                    setNewPassword("");
                  }}
                  variant="secondary"
                  aria-label={t("cancelButtonAriaLabel")}
                />
              </div>
            </div>
          )}
        </div>

        {!hasProjects && (
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

        {!hasProjects && (
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
            <Loader variant="inline" />
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
