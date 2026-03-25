import { getBoardOnboardingProgress } from "@/modules/board/presentation/pages/board/boardOnboardingProgress";

describe("getBoardOnboardingProgress", () => {
  it("marks ticket creation as current when the board is still empty", () => {
    expect(
      getBoardOnboardingProgress({
        ticketCount: 0,
        assignedTicketCount: 0,
        commentCount: 0,
      })
    ).toEqual({
      hasCreateTicketStepCompleted: false,
      hasAssignTicketStepCompleted: false,
      hasCommentTicketStepCompleted: false,
      areAllStepsCompleted: false,
      createTicketStepStatus: "current",
      assignTicketStepStatus: "pending",
      commentTicketStepStatus: "pending",
    });
  });

  it("marks assignment as current once a ticket exists", () => {
    expect(
      getBoardOnboardingProgress({
        ticketCount: 1,
        assignedTicketCount: 0,
        commentCount: 0,
      })
    ).toEqual({
      hasCreateTicketStepCompleted: true,
      hasAssignTicketStepCompleted: false,
      hasCommentTicketStepCompleted: false,
      areAllStepsCompleted: false,
      createTicketStepStatus: "complete",
      assignTicketStepStatus: "current",
      commentTicketStepStatus: "pending",
    });
  });

  it("marks comments as current once a ticket has been assigned", () => {
    expect(
      getBoardOnboardingProgress({
        ticketCount: 1,
        assignedTicketCount: 1,
        commentCount: 0,
      })
    ).toEqual({
      hasCreateTicketStepCompleted: true,
      hasAssignTicketStepCompleted: true,
      hasCommentTicketStepCompleted: false,
      areAllStepsCompleted: false,
      createTicketStepStatus: "complete",
      assignTicketStepStatus: "complete",
      commentTicketStepStatus: "current",
    });
  });

  it("marks the full onboarding complete when ticket, assignment, and comment exist", () => {
    expect(
      getBoardOnboardingProgress({
        ticketCount: 1,
        assignedTicketCount: 1,
        commentCount: 1,
      })
    ).toEqual({
      hasCreateTicketStepCompleted: true,
      hasAssignTicketStepCompleted: true,
      hasCommentTicketStepCompleted: true,
      areAllStepsCompleted: true,
      createTicketStepStatus: "complete",
      assignTicketStepStatus: "complete",
      commentTicketStepStatus: "complete",
    });
  });
});
