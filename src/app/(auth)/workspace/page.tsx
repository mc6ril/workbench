"use client";

import { useEffect, useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import type { CreateProjectInput } from "@/core/domain/schema/project.schema";
import { CreateProjectInputSchema } from "@/core/domain/schema/project.schema";

import Button from "@/presentation/components/ui/Button";
import EmptyState from "@/presentation/components/ui/EmptyState";
import ErrorMessage from "@/presentation/components/ui/ErrorMessage";
import Form from "@/presentation/components/ui/Form";
import Input from "@/presentation/components/ui/Input";
import Loader from "@/presentation/components/ui/Loader";
import Text from "@/presentation/components/ui/Text";
import Title from "@/presentation/components/ui/Title";
import {
  useAddUserToProject,
  useCreateProject,
  useDeleteUser,
  useProjects,
  useSession,
  useSignOut,
  useUpdateUser,
} from "@/presentation/hooks";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { shouldShowLoading } from "@/shared/utils";
import { buildProjectRoute } from "@/shared/utils/routes";

import styles from "./WorkspacePage.module.scss";

type CreateProjectFormData = CreateProjectInput;

const WorkspacePage = () => {
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
  const tErrors = useTranslation("errors");

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
      setProjectId("");
      await refetchProjects();
    } catch (err) {
      const error = err as { code?: string };
      const errorMessage = getErrorMessage(error, tErrors);
      setError(errorMessage);
    }
  };

  useEffect(() => {
    if (createProjectMutation.error) {
      const error = createProjectMutation.error as { code?: string };
      const errorMessage = getErrorMessage(error, tErrors);

      if (error.code === "CONSTRAINT_VIOLATION") {
        setFormError("name", {
          type: "server",
          message: errorMessage,
        });
      } else {
        setFormError("root", {
          type: "server",
          message: errorMessage,
        });
      }
    }
  }, [createProjectMutation.error, setFormError, tErrors]);

  useEffect(() => {
    if (createProjectMutation.isSuccess && createProjectMutation.data) {
      isSubmittingRef.current = false;
      // Redirect to project board using new route pattern
      router.push(
        buildProjectRoute(createProjectMutation.data.id, PROJECT_VIEWS.BOARD)
      );
    }
  }, [createProjectMutation.isSuccess, createProjectMutation.data, router]);

  useEffect(() => {
    if (createProjectMutation.error) {
      isSubmittingRef.current = false;
    }
  }, [createProjectMutation.error]);

  const onCreateProjectSubmit: SubmitHandler<CreateProjectFormData> = async (
    data
  ) => {
    if (isSubmittingRef.current || createProjectMutation.isPending) {
      return;
    }

    isSubmittingRef.current = true;
    try {
      await createProjectMutation.mutateAsync(data);
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 100);
    }
  };

  const hasProjects = Array.isArray(projects) && projects.length > 0;

  const shouldShowInitialLoader = shouldShowLoading({
    isLoading:
      isLoadingSession ||
      isLoadingProjects ||
      isFetchingProjects ||
      projects === undefined,
    isFetching: isFetchingProjects,
  });

  if (shouldShowInitialLoader) {
    return (
      <main className={styles["workspace-page"]}>
        <Loader variant="full-page" />
      </main>
    );
  }

  return (
    <main className={styles["workspace-page"]}>
      <div className={styles["workspace-container"]}>
        <div className={styles["workspace-header"]}>
          <Title variant="h1" className={styles["workspace-title"]}>
            {t("welcomeTitle")}
          </Title>
          {session && (
            <Text variant="body" className={styles["workspace-user-info"]}>
              {t("signedInAs")} <strong>{session.email}</strong>
            </Text>
          )}
          <div className={styles["workspace-user-actions"]}>
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
            <div className={styles["workspace-update-user-form"]}>
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
              <div className={styles["workspace-update-user-actions"]}>
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
          <section className={styles["workspace-section"]}>
            <Title variant="h2" className={styles["workspace-section-title"]}>
              {t("createProjectTitle")}
            </Title>
            <Text
              variant="small"
              className={styles["workspace-section-description"]}
            >
              {t("createProjectDescription")}
            </Text>
            <Form
              onSubmit={handleSubmit(onCreateProjectSubmit)}
              className={styles["workspace-create-form"]}
              error={errors.root?.message}
              noValidate
            >
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
            </Form>
          </section>
        )}

        {!hasProjects && (
          <section className={styles["workspace-section"]}>
            <Title variant="h2" className={styles["workspace-section-title"]}>
              {t("accessProjectTitle")}
            </Title>
            <Text
              variant="small"
              className={styles["workspace-section-description"]}
            >
              {t("accessProjectDescription")}
            </Text>
            <div className={styles["workspace-access-form"]}>
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

        <section className={styles["workspace-section"]}>
          <Title variant="h2" className={styles["workspace-section-title"]}>
            {t("yourProjectsTitle")}
          </Title>
          {projectsError && (
            <ErrorMessage
              error={projectsError as { code?: string }}
              onRetry={refetchProjects}
            />
          )}
          {shouldShowLoading({
            isLoading: isLoadingProjects,
            isPending: addUserToProjectMutation.isPending,
          }) ? (
            <Loader variant="inline" />
          ) : Array.isArray(projects) && projects.length > 0 ? (
            <ul className={styles["workspace-projects-list"]}>
              {projects.map((project) => {
                const roleLabel =
                  project.role === "admin"
                    ? t("roleAdmin")
                    : project.role === "member"
                      ? t("roleMember")
                      : t("roleViewer");
                return (
                  <li
                    key={project.id}
                    className={styles["workspace-project-item"]}
                  >
                    <a
                      href={buildProjectRoute(project.id, PROJECT_VIEWS.BOARD)}
                      className={styles["workspace-project-link"]}
                      aria-label={`${project.name}, ${t("roleAriaLabel")}: ${roleLabel}`}
                    >
                      <span className={styles["workspace-project-name"]}>
                        {project.name}
                      </span>
                      <span className={styles["workspace-project-role"]}>
                        {roleLabel}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : Array.isArray(projects) && projects.length === 0 ? (
            <EmptyState title={t("noProjects")} />
          ) : null}
        </section>
      </div>
    </main>
  );
};

export default WorkspacePage;
