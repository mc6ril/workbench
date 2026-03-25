import { getEpicsOnboardingProgress } from "@/modules/board/presentation/pages/epics/epicsOnboardingProgress";

describe("getEpicsOnboardingProgress", () => {
  it("blocks follow-up steps until a first goal exists", () => {
    const result = getEpicsOnboardingProgress({
      epicCount: 0,
      linkedTicketCount: 0,
      progressingEpicCount: 0,
    });

    expect(result.createEpicStepStatus).toBe("current");
    expect(result.linkTicketStepStatus).toBe("blocked");
    expect(result.trackProgressStepStatus).toBe("blocked");
    expect(result.areAllStepsCompleted).toBe(false);
  });

  it("moves to linking once a goal exists", () => {
    const result = getEpicsOnboardingProgress({
      epicCount: 1,
      linkedTicketCount: 0,
      progressingEpicCount: 0,
    });

    expect(result.createEpicStepStatus).toBe("complete");
    expect(result.linkTicketStepStatus).toBe("current");
    expect(result.trackProgressStepStatus).toBe("blocked");
  });

  it("completes the flow once a linked ticket advances the goal", () => {
    const result = getEpicsOnboardingProgress({
      epicCount: 1,
      linkedTicketCount: 1,
      progressingEpicCount: 1,
    });

    expect(result.createEpicStepStatus).toBe("complete");
    expect(result.linkTicketStepStatus).toBe("complete");
    expect(result.trackProgressStepStatus).toBe("complete");
    expect(result.areAllStepsCompleted).toBe(true);
  });
});
