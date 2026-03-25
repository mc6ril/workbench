import {
  ONBOARDING_STEP_STATUS,
  type OnboardingProgressStepStatus,
} from "@/modules/board/presentation/components/boardOnboardingPanel/onboarding.types";

export type BoardOnboardingProgress = {
  hasCreateTicketStepCompleted: boolean;
  hasAssignTicketStepCompleted: boolean;
  hasCommentTicketStepCompleted: boolean;
  areAllStepsCompleted: boolean;
  createTicketStepStatus: OnboardingProgressStepStatus;
  assignTicketStepStatus: OnboardingProgressStepStatus;
  commentTicketStepStatus: OnboardingProgressStepStatus;
};

type BoardOnboardingProgressInput = {
  ticketCount: number;
  assignedTicketCount: number;
  commentCount: number;
};

const getStepStatus = ({
  isCompleted,
  stepIndex,
  firstIncompleteStepIndex,
}: {
  isCompleted: boolean;
  stepIndex: number;
  firstIncompleteStepIndex: number;
}): OnboardingProgressStepStatus => {
  if (isCompleted) {
    return ONBOARDING_STEP_STATUS.COMPLETE;
  }

  return firstIncompleteStepIndex === stepIndex
    ? ONBOARDING_STEP_STATUS.CURRENT
    : ONBOARDING_STEP_STATUS.PENDING;
};

export const getBoardOnboardingProgress = ({
  ticketCount,
  assignedTicketCount,
  commentCount,
}: BoardOnboardingProgressInput): BoardOnboardingProgress => {
  const hasCreateTicketStepCompleted = ticketCount > 0;
  const hasAssignTicketStepCompleted = assignedTicketCount > 0;
  const hasCommentTicketStepCompleted = commentCount > 0;
  const completion = [
    hasCreateTicketStepCompleted,
    hasAssignTicketStepCompleted,
    hasCommentTicketStepCompleted,
  ];
  const firstIncompleteStepIndex = completion.findIndex(
    (stepCompleted) => !stepCompleted
  );

  return {
    hasCreateTicketStepCompleted,
    hasAssignTicketStepCompleted,
    hasCommentTicketStepCompleted,
    areAllStepsCompleted:
      hasCreateTicketStepCompleted &&
      hasAssignTicketStepCompleted &&
      hasCommentTicketStepCompleted,
    createTicketStepStatus: getStepStatus({
      isCompleted: hasCreateTicketStepCompleted,
      stepIndex: 0,
      firstIncompleteStepIndex,
    }),
    assignTicketStepStatus: getStepStatus({
      isCompleted: hasAssignTicketStepCompleted,
      stepIndex: 1,
      firstIncompleteStepIndex,
    }),
    commentTicketStepStatus: getStepStatus({
      isCompleted: hasCommentTicketStepCompleted,
      stepIndex: 2,
      firstIncompleteStepIndex,
    }),
  };
};
