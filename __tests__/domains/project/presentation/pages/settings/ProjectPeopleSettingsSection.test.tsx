import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { PlanFeature } from "@/domains/billing/core/domain/planFeatures.rules";
import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.schema";
import { useFeatureAccess } from "@/domains/billing/presentation/hooks/useFeatureAccess";
import {
  InvitationStatus,
  type ProjectInvitation,
} from "@/domains/project/core/domain/schema/invitation.schema";
import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
import { useInviteMember } from "@/domains/project/presentation/hooks/invitation/useInviteMember";
import { useProjectInvitations } from "@/domains/project/presentation/hooks/invitation/useProjectInvitations";
import { useRevokeInvitation } from "@/domains/project/presentation/hooks/invitation/useRevokeInvitation";
import { useProjectMembers } from "@/domains/project/presentation/hooks/member/useProjectMembers";
import { useRemoveMember } from "@/domains/project/presentation/hooks/member/useRemoveMember";
import { useUpdateMemberRole } from "@/domains/project/presentation/hooks/member/useUpdateMemberRole";
import ProjectPeopleSettingsSection from "@/domains/project/presentation/pages/settings/components/ProjectPeopleSettingsSection";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

const replaceMock = jest.fn();
const addToastMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

jest.mock("@/domains/session/presentation/hooks/useSession", () => ({
  useSession: jest.fn(),
}));

jest.mock(
  "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider",
  () => ({
    useProjectPermissions: jest.fn(),
  })
);

jest.mock(
  "@/domains/project/presentation/hooks/member/useProjectMembers",
  () => ({
    useProjectMembers: jest.fn(),
  })
);

jest.mock(
  "@/domains/project/presentation/hooks/invitation/useProjectInvitations",
  () => ({
    useProjectInvitations: jest.fn(),
  })
);

jest.mock("@/domains/billing/presentation/hooks/useFeatureAccess", () => ({
  useFeatureAccess: jest.fn(),
}));

jest.mock(
  "@/domains/project/presentation/hooks/invitation/useInviteMember",
  () => ({
    useInviteMember: jest.fn(),
  })
);

jest.mock(
  "@/domains/project/presentation/hooks/invitation/useRevokeInvitation",
  () => ({
    useRevokeInvitation: jest.fn(),
  })
);

jest.mock(
  "@/domains/project/presentation/hooks/member/useUpdateMemberRole",
  () => ({
    useUpdateMemberRole: jest.fn(),
  })
);

jest.mock(
  "@/domains/project/presentation/hooks/member/useRemoveMember",
  () => ({
    useRemoveMember: jest.fn(),
  })
);

jest.mock("@/shared/stores/useToastStore", () => ({
  useToastStore: (
    selector: (state: { addToast: typeof addToastMock }) => unknown
  ) => selector({ addToast: addToastMock }),
}));

const PROJECT_ID = "123e4567-e89b-12d3-a456-426614174000";
const CURRENT_USER_ID = "123e4567-e89b-12d3-a456-426614174999";

const MEMBERS: ProjectMember[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    projectId: PROJECT_ID,
    userId: CURRENT_USER_ID,
    role: ProjectRole.ADMIN,
    profile: {
      id: CURRENT_USER_ID,
      email: "owner@example.com",
      displayName: "Camille",
      avatarUrl: null,
      preferences: {
        theme: "system",
        emailNotifications: true,
        language: "fr",
        gettingStartedStatus: "completed",
      },
      termsAcceptedAt: null,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174002",
    projectId: PROJECT_ID,
    userId: "123e4567-e89b-12d3-a456-426614174888",
    role: ProjectRole.MEMBER,
    profile: {
      id: "123e4567-e89b-12d3-a456-426614174888",
      email: "marie@example.com",
      displayName: "Marie",
      avatarUrl: null,
      preferences: {
        theme: "system",
        emailNotifications: true,
        language: "fr",
        gettingStartedStatus: "completed",
      },
      termsAcceptedAt: null,
      createdAt: new Date("2024-01-02T00:00:00Z"),
      updatedAt: new Date("2024-01-02T00:00:00Z"),
    },
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  },
];

const INVITATIONS: ProjectInvitation[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174111",
    projectId: PROJECT_ID,
    role: ProjectRole.MEMBER,
    status: InvitationStatus.PENDING,
    token: "invite-token",
    invitedBy: CURRENT_USER_ID,
    expiresAt: new Date("2030-01-10T00:00:00Z"),
    createdAt: new Date("2030-01-03T00:00:00Z"),
    updatedAt: new Date("2030-01-03T00:00:00Z"),
  },
];

const asMockedReturn = <T,>(value: unknown): T => value as T;

describe("ProjectPeopleSettingsSection", () => {
  const inviteMutateAsync = jest.fn();
  const inviteReset = jest.fn();
  const revokeMutateAsync = jest.fn();
  const revokeReset = jest.fn();
  const updateRoleMutateAsync = jest.fn();
  const updateRoleReset = jest.fn();
  const removeMemberMutateAsync = jest.fn();
  const removeMemberReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useSession).mockReturnValue(
      asMockedReturn<ReturnType<typeof useSession>>({
        data: {
          userId: CURRENT_USER_ID,
          email: "owner@example.com",
          isSuperuser: false,
        },
      })
    );

    jest.mocked(useProjectPermissions).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectPermissions>>({
        role: ProjectRole.ADMIN,
        isLoading: false,
        canEditProject: true,
        canDeleteProject: true,
        canManageMembers: true,
        canComment: true,
        canCreateTicket: true,
        canMoveTicket: true,
        canCreateEpic: true,
        canEditTicket: true,
        canDeleteTicket: true,
        isViewer: false,
        isMember: false,
        isAdmin: true,
      })
    );

    jest.mocked(useProjectMembers).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectMembers>>({
        data: MEMBERS,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: jest.fn(),
      })
    );

    jest.mocked(useProjectInvitations).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectInvitations>>({
        data: INVITATIONS,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: jest.fn(),
      })
    );

    jest.mocked(useFeatureAccess).mockImplementation((feature) => {
      if (feature === PlanFeature.ADVANCED_ROLES) {
        return asMockedReturn<ReturnType<typeof useFeatureAccess>>({
          hasAccess: true,
          currentPlan: SubscriptionPlan.TEAM,
          minimumPlan: SubscriptionPlan.TEAM,
          limit: undefined,
          isLoading: false,
        });
      }

      return asMockedReturn<ReturnType<typeof useFeatureAccess>>({
        hasAccess: true,
        currentPlan: SubscriptionPlan.TEAM,
        minimumPlan: SubscriptionPlan.FREE,
        limit: 20,
        isLoading: false,
      });
    });

    jest.mocked(useInviteMember).mockReturnValue(
      asMockedReturn<ReturnType<typeof useInviteMember>>({
        mutateAsync: inviteMutateAsync,
        isPending: false,
        error: null,
        reset: inviteReset,
      })
    );

    jest.mocked(useRevokeInvitation).mockReturnValue(
      asMockedReturn<ReturnType<typeof useRevokeInvitation>>({
        mutateAsync: revokeMutateAsync,
        isPending: false,
        error: null,
        reset: revokeReset,
      })
    );

    jest.mocked(useUpdateMemberRole).mockReturnValue(
      asMockedReturn<ReturnType<typeof useUpdateMemberRole>>({
        mutateAsync: updateRoleMutateAsync,
        isPending: false,
        error: null,
        reset: updateRoleReset,
      })
    );

    jest.mocked(useRemoveMember).mockReturnValue(
      asMockedReturn<ReturnType<typeof useRemoveMember>>({
        mutateAsync: removeMemberMutateAsync,
        isPending: false,
        error: null,
        reset: removeMemberReset,
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("allows an administrator to create invitations and manage members", async () => {
    inviteMutateAsync.mockResolvedValue({
      ...INVITATIONS[0],
      token: "new-token",
    });
    updateRoleMutateAsync.mockResolvedValue(undefined);
    removeMemberMutateAsync.mockResolvedValue(undefined);
    revokeMutateAsync.mockResolvedValue(undefined);

    render(<ProjectPeopleSettingsSection projectId={PROJECT_ID} />);

    fireEvent.click(screen.getByRole("button", { name: "Créer un lien" }));

    await waitFor(() => {
      expect(inviteMutateAsync).toHaveBeenCalledWith({
        input: {
          projectId: PROJECT_ID,
          role: ProjectRole.MEMBER,
        },
        currentPlan: SubscriptionPlan.TEAM,
      });
    });

    fireEvent.change(screen.getByLabelText("Changer le rôle de Marie"), {
      target: { value: ProjectRole.ADMIN },
    });

    await waitFor(() => {
      expect(updateRoleMutateAsync).toHaveBeenCalledWith({
        memberId: MEMBERS[1].id,
        role: ProjectRole.ADMIN,
        projectId: PROJECT_ID,
      });
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Retirer Marie du projet" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Confirmer le retrait" })
    );

    await waitFor(() => {
      expect(removeMemberMutateAsync).toHaveBeenCalledWith({
        memberId: MEMBERS[1].id,
        projectId: PROJECT_ID,
      });
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /Révoquer l'invitation qui expire le/i,
      })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Confirmer la révocation" })
    );

    await waitFor(() => {
      expect(revokeMutateAsync).toHaveBeenCalledWith({
        invitationId: INVITATIONS[0].id,
        projectId: PROJECT_ID,
      });
    });
  });

  it("shows explicit plan gating when advanced roles are locked and the member limit is reached", () => {
    jest.mocked(useFeatureAccess).mockImplementation((feature) => {
      if (feature === PlanFeature.ADVANCED_ROLES) {
        return asMockedReturn<ReturnType<typeof useFeatureAccess>>({
          hasAccess: false,
          currentPlan: SubscriptionPlan.FREE,
          minimumPlan: SubscriptionPlan.TEAM,
          limit: 0,
          isLoading: false,
        });
      }

      return asMockedReturn<ReturnType<typeof useFeatureAccess>>({
        hasAccess: true,
        currentPlan: SubscriptionPlan.FREE,
        minimumPlan: SubscriptionPlan.FREE,
        limit: 2,
        isLoading: false,
      });
    });

    render(<ProjectPeopleSettingsSection projectId={PROJECT_ID} />);

    expect(
      screen.getByText(/Le rôle Observateur est réservé au plan/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/La limite de 2 accès est atteinte/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Observateur" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Créer un lien" })
    ).toBeDisabled();
  });

  it("renders loading states for members and invitations", () => {
    jest.mocked(useProjectMembers).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectMembers>>({
        data: [],
        isLoading: true,
        isFetching: false,
        error: null,
        refetch: jest.fn(),
      })
    );

    jest.mocked(useProjectInvitations).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectInvitations>>({
        data: [],
        isLoading: true,
        isFetching: false,
        error: null,
        refetch: jest.fn(),
      })
    );

    render(<ProjectPeopleSettingsSection projectId={PROJECT_ID} />);

    expect(screen.getByText("Chargement des membres...")).toBeInTheDocument();
    expect(
      screen.getByText("Chargement des invitations...")
    ).toBeInTheDocument();
  });

  it("hides the active invitation links block when there are no pending invitations", () => {
    jest.mocked(useProjectMembers).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectMembers>>({
        data: [],
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: jest.fn(),
      })
    );

    jest.mocked(useProjectInvitations).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectInvitations>>({
        data: [],
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: jest.fn(),
      })
    );

    render(<ProjectPeopleSettingsSection projectId={PROJECT_ID} />);

    expect(screen.getByText("Aucun membre à afficher")).toBeInTheDocument();
    expect(
      screen.queryByText("Aucune invitation en attente")
    ).not.toBeInTheDocument();
  });

  it("renders retry states when members or invitations fail to load", () => {
    jest.mocked(useProjectMembers).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectMembers>>({
        data: [],
        isLoading: false,
        isFetching: false,
        error: { code: "DATABASE_ERROR" },
        refetch: jest.fn(),
      })
    );

    jest.mocked(useProjectInvitations).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectInvitations>>({
        data: [],
        isLoading: false,
        isFetching: false,
        error: { code: "DATABASE_ERROR" },
        refetch: jest.fn(),
      })
    );

    render(<ProjectPeopleSettingsSection projectId={PROJECT_ID} />);

    expect(
      screen.getByText("Impossible de charger les membres")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Impossible de charger les invitations")
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Réessayer l'opération" })
    ).toHaveLength(2);
  });

  it("hides role and remove actions for the sole administrator account", () => {
    jest.mocked(useProjectMembers).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectMembers>>({
        data: [MEMBERS[0]],
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: jest.fn(),
      })
    );

    render(<ProjectPeopleSettingsSection projectId={PROJECT_ID} />);

    expect(
      screen.queryByLabelText("Changer le rôle de Camille")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Retirer Camille du projet",
      })
    ).not.toBeInTheDocument();
  });

  it("hides role and remove actions for the only admin row", () => {
    render(<ProjectPeopleSettingsSection projectId={PROJECT_ID} />);

    expect(
      screen.queryByLabelText("Changer le rôle de Camille")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Retirer Camille du projet",
      })
    ).not.toBeInTheDocument();

    expect(
      screen.getByLabelText("Changer le rôle de Marie")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Retirer Marie du projet",
      })
    ).toBeInTheDocument();
  });

  it("hides role and remove actions when user cannot manage members", () => {
    jest.mocked(useProjectPermissions).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectPermissions>>({
        role: ProjectRole.MEMBER,
        isLoading: false,
        canEditProject: true,
        canDeleteProject: false,
        canManageMembers: false,
        canComment: true,
        canCreateTicket: true,
        canMoveTicket: true,
        canCreateEpic: true,
        canEditTicket: true,
        canDeleteTicket: false,
        isViewer: false,
        isMember: true,
        isAdmin: false,
      })
    );

    render(<ProjectPeopleSettingsSection projectId={PROJECT_ID} />);

    expect(
      screen.queryByText("Invitations en attente")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Seul un administrateur peut inviter, changer les rôles ou retirer un membre du projet."
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Changer le rôle de Marie")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Retirer Marie du projet",
      })
    ).not.toBeInTheDocument();
  });
});
