import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.schema";
import { ProjectRole } from "@/domains/project/core/domain/schema/project.schema";
import InviteProjectModal from "@/domains/project/presentation/components/inviteProjectModal/InviteProjectModal";
import { useInviteMember } from "@/domains/project/presentation/hooks/invitation/useInviteMember";

const addToastMock = jest.fn();
const mutateAsyncMock = jest.fn();
const resetMock = jest.fn();

jest.mock("@/domains/project/presentation/hooks/invitation/useInviteMember", () => ({
  useInviteMember: jest.fn(),
}));

jest.mock("@/shared/stores/useToastStore", () => ({
  useToastStore: (
    selector: (state: { addToast: typeof addToastMock }) => unknown
  ) => selector({ addToast: addToastMock }),
}));

const asMockedReturn = <T,>(value: unknown): T => value as T;

describe("InviteProjectModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useInviteMember).mockReturnValue(
      asMockedReturn<ReturnType<typeof useInviteMember>>({
        mutateAsync: mutateAsyncMock,
        reset: resetMock,
        isPending: false,
        error: null,
      })
    );
  });

  it("creates an invitation link for the current project", async () => {
    mutateAsyncMock.mockResolvedValue({
      token: "abc123",
    });

    render(
      <InviteProjectModal
        isOpen
        onClose={jest.fn()}
        projectId="123e4567-e89b-12d3-a456-426614174000"
        projectName="Maison"
        currentPlan={SubscriptionPlan.FREE}
        isSubscriptionLoading={false}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Créer le lien d'invitation",
        hidden: true,
      })
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        input: {
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          role: ProjectRole.MEMBER,
        },
        currentPlan: SubscriptionPlan.FREE,
      });
    });

    await waitFor(() => {
      expect(
        screen.getByDisplayValue("http://localhost/join/abc123")
      ).toBeInTheDocument();
    });
  });

  it("closes the modal through the provided callback", () => {
    const onClose = jest.fn();

    render(
      <InviteProjectModal
        isOpen
        onClose={onClose}
        projectId="123e4567-e89b-12d3-a456-426614174000"
        projectName="Maison"
        currentPlan={SubscriptionPlan.FREE}
        isSubscriptionLoading={false}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fermer la fenêtre d'invitation",
        hidden: true,
      })
    );

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(resetMock).not.toHaveBeenCalled();
  });

  it("does not reset on initial render when the modal is closed", () => {
    render(
      <InviteProjectModal
        isOpen={false}
        onClose={jest.fn()}
        projectId="123e4567-e89b-12d3-a456-426614174000"
        projectName="Maison"
        currentPlan={SubscriptionPlan.FREE}
        isSubscriptionLoading={false}
      />
    );

    expect(resetMock).not.toHaveBeenCalled();
  });
});
