import {
  ONBOARDING_STEP_STATUS,
  type OnboardingStepStatus,
} from "@/modules/board/presentation/components/boardOnboardingPanel/onboarding.types";

export type EpicsOnboardingProgress = {
  hasCreateEpicStepCompleted: boolean;
  hasLinkTicketStepCompleted: boolean;
  hasTrackProgressStepCompleted: boolean;
  areAllStepsCompleted: boolean;
  createEpicStepStatus: OnboardingStepStatus;
  linkTicketStepStatus: OnboardingStepStatus;
  trackProgressStepStatus: OnboardingStepStatus;
};

type EpicsOnboardingProgressInput = {
  epicCount: number;
  linkedTicketCount: number;
  progressingEpicCount: number;
};

export const getEpicsOnboardingProgress = ({
  epicCount,
  linkedTicketCount,
  progressingEpicCount,
}: EpicsOnboardingProgressInput): EpicsOnboardingProgress => {
  const hasCreateEpicStepCompleted = epicCount > 0;
  const hasLinkTicketStepCompleted = linkedTicketCount > 0;
  const hasTrackProgressStepCompleted = progressingEpicCount > 0;

  return {
    hasCreateEpicStepCompleted,
    hasLinkTicketStepCompleted,
    hasTrackProgressStepCompleted,
    areAllStepsCompleted:
      hasCreateEpicStepCompleted &&
      hasLinkTicketStepCompleted &&
      hasTrackProgressStepCompleted,
    createEpicStepStatus: hasCreateEpicStepCompleted
      ? ONBOARDING_STEP_STATUS.COMPLETE
      : ONBOARDING_STEP_STATUS.CURRENT,
    linkTicketStepStatus: !hasCreateEpicStepCompleted
      ? ONBOARDING_STEP_STATUS.BLOCKED
      : hasLinkTicketStepCompleted
        ? ONBOARDING_STEP_STATUS.COMPLETE
        : ONBOARDING_STEP_STATUS.CURRENT,
    trackProgressStepStatus: !hasLinkTicketStepCompleted
      ? ONBOARDING_STEP_STATUS.BLOCKED
      : hasTrackProgressStepCompleted
        ? ONBOARDING_STEP_STATUS.COMPLETE
        : ONBOARDING_STEP_STATUS.CURRENT,
  };
};
