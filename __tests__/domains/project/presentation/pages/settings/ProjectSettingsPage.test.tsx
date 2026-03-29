import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
import { useDeleteProject } from "@/domains/project/presentation/hooks/useDeleteProject";
import { useProject } from "@/domains/project/presentation/hooks/useProject";
import { useUpdateProject } from "@/domains/project/presentation/hooks/useUpdateProject";
import ProjectSettingsPage from "@/domains/project/presentation/pages/settings/ProjectSettingsPage";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

jest.mock("@/domains/project/presentation/hooks/useProject", () => ({
  useProject: jest.fn(),
}));

jest.mock(
  "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider",
  () => ({
    useProjectPermissions: jest.fn(),
  })
);

jest.mock("@/domains/project/presentation/hooks/useUpdateProject", () => ({
  useUpdateProject: jest.fn(),
}));

jest.mock("@/domains/project/presentation/hooks/useDeleteProject", () => ({
  useDeleteProject: jest.fn(),
}));

jest.mock(
  "@/domains/project/presentation/pages/settings/components/ProjectPeopleSettingsSection",
  () => ({
    __esModule: true,
    default: function MockProjectPeopleSettingsSection() {
      return <div data-testid="project-people-settings-section" />;
    },
  })
);

const PROJECT_ID = "123e4567-e89b-12d3-a456-426614174000";
const PROJECT = {
  id: PROJECT_ID,
  name: "Projet Alpha",
  shortCode: "PA",
  boardEmoji: "📋",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-02T00:00:00Z"),
};

const asMockedReturn = <T,>(value: unknown): T => value as T;

describe("ProjectSettingsPage", () => {
  const updateMutateAsync = jest.fn();
  const updateReset = jest.fn();
  const deleteMutateAsync = jest.fn();
  const deleteReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useProject).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProject>>({
        data: PROJECT,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })
    );

    jest.mocked(useUpdateProject).mockReturnValue(
      asMockedReturn<ReturnType<typeof useUpdateProject>>({
        mutateAsync: updateMutateAsync,
        isPending: false,
        isSuccess: false,
        error: null,
        reset: updateReset,
      })
    );

    jest.mocked(useDeleteProject).mockReturnValue(
      asMockedReturn<ReturnType<typeof useDeleteProject>>({
        mutateAsync: deleteMutateAsync,
        isPending: false,
        error: null,
        reset: deleteReset,
      })
    );
  });

  it("renders the page in read-only mode for viewers", () => {
    jest.mocked(useProjectPermissions).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectPermissions>>({
        role: ProjectRole.VIEWER,
        isLoading: false,
        canEditProject: false,
        canDeleteProject: false,
        canManageMembers: false,
      })
    );

    render(<ProjectSettingsPage projectId={PROJECT_ID} />);

    expect(screen.queryByText("Gouvernance")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nom du projet")).toBeDisabled();
    expect(screen.getByText("Code projet")).toBeInTheDocument();
    expect(screen.getByText("Créé le")).toBeInTheDocument();
    expect(screen.getByText("Modification du projet")).toBeInTheDocument();
    expect(screen.getByText("Invitation")).toBeInTheDocument();
    expect(screen.getByText("Modification du rôle")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Ouvrir la confirmation de suppression du projet",
      })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Lecteur")).toBeInTheDocument();
  });

  it("saves a renamed project for editable roles", async () => {
    updateMutateAsync.mockResolvedValue({
      ...PROJECT,
      name: "Projet Beta",
    });

    jest.mocked(useProjectPermissions).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectPermissions>>({
        role: ProjectRole.MEMBER,
        isLoading: false,
        canEditProject: true,
        canDeleteProject: false,
        canManageMembers: false,
      })
    );

    render(<ProjectSettingsPage projectId={PROJECT_ID} />);

    expect(
      screen.queryByRole("button", { name: "Réinitialiser" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Enregistrer" })
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Nom du projet"), {
      target: { value: "Projet Beta" },
    });

    expect(
      screen.getByRole("button", { name: "Réinitialiser" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enregistrer" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        projectId: PROJECT_ID,
        input: { name: "Projet Beta" },
      });
    });
  });

  it("strips a shared board emoji prefix from the project name in settings", async () => {
    updateMutateAsync.mockResolvedValue({
      ...PROJECT,
      name: "Projet Beta",
    });

    jest.mocked(useProject).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProject>>({
        data: {
          ...PROJECT,
          name: "📋 Projet Alpha",
        },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })
    );

    jest.mocked(useProjectPermissions).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectPermissions>>({
        role: ProjectRole.MEMBER,
        isLoading: false,
        canEditProject: true,
        canDeleteProject: false,
        canManageMembers: false,
      })
    );

    render(<ProjectSettingsPage projectId={PROJECT_ID} />);

    expect(screen.getByLabelText("Nom du projet")).toHaveValue("Projet Alpha");

    fireEvent.change(screen.getByLabelText("Nom du projet"), {
      target: { value: "🚀 Projet Beta" },
    });

    expect(screen.getByLabelText("Nom du projet")).toHaveValue("Projet Beta");

    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        projectId: PROJECT_ID,
        input: { name: "Projet Beta" },
      });
    });
  });

  it("resets the local project form to the saved database state", () => {
    jest.mocked(useProjectPermissions).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectPermissions>>({
        role: ProjectRole.ADMIN,
        isLoading: false,
        canEditProject: true,
        canDeleteProject: true,
        canManageMembers: true,
      })
    );

    render(<ProjectSettingsPage projectId={PROJECT_ID} />);

    expect(
      screen.queryByRole("button", { name: "Réinitialiser" })
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Choisir l’emoji du board 🚀",
      })
    );

    expect(
      screen.getByRole("button", { name: "Réinitialiser" })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Nom du projet"), {
      target: { value: "Projet Temporaire" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser" }));

    expect(updateMutateAsync).not.toHaveBeenCalled();
    expect(updateReset).toHaveBeenCalled();
    expect(screen.getByLabelText("Nom du projet")).toHaveValue(PROJECT.name);
    expect(
      screen.getByRole("button", {
        name: "Choisir l’emoji du board 📋",
      })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", {
        name: "Choisir l’emoji du board 🚀",
      })
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.queryByRole("button", { name: "Réinitialiser" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Enregistrer" })
    ).not.toBeInTheDocument();
  });

  it("requires an exact confirmation before deleting the project", async () => {
    deleteMutateAsync.mockResolvedValue(undefined);

    jest.mocked(useProjectPermissions).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectPermissions>>({
        role: ProjectRole.ADMIN,
        isLoading: false,
        canEditProject: true,
        canDeleteProject: true,
        canManageMembers: true,
      })
    );

    render(<ProjectSettingsPage projectId={PROJECT_ID} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ouvrir la confirmation de suppression du projet",
      })
    );

    const confirmButton = screen.getByRole("button", {
      name: "Supprimer définitivement",
    });

    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Confirmer le nom du projet"), {
      target: { value: PROJECT.name },
    });

    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteMutateAsync).toHaveBeenCalledWith(PROJECT_ID);
      expect(replaceMock).toHaveBeenCalledWith("/workspace");
    });
  });
});
