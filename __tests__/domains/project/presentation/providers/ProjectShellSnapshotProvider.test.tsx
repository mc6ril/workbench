import { fireEvent, render, screen } from "@testing-library/react";

import { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import {
  ProjectShellSnapshotProvider,
  useProjectShellSnapshot,
  useProjectShellSnapshotActions,
} from "@/domains/project/presentation/providers/ProjectShellSnapshotProvider";

const SnapshotConsumer = () => {
  const { enabledModules } = useProjectShellSnapshot();
  const { updateEnabledModules } = useProjectShellSnapshotActions();

  return (
    <div>
      <div data-testid="enabled-modules">{enabledModules.join(",")}</div>
      <button
        type="button"
        onClick={() => updateEnabledModules([ProjectModuleKey.RECIPES])}
      >
        Update modules
      </button>
    </div>
  );
};

describe("ProjectShellSnapshotProvider", () => {
  it("exposes actions to update the snapshot client-side", () => {
    render(
      <ProjectShellSnapshotProvider
        snapshot={{
          projectId: "project-1",
          enabledModules: [],
          isRecipesBoardVisible: true,
          role: null,
        }}
      >
        <SnapshotConsumer />
      </ProjectShellSnapshotProvider>
    );

    expect(screen.getByTestId("enabled-modules").textContent).toBe("");

    fireEvent.click(screen.getByText("Update modules"));

    expect(screen.getByTestId("enabled-modules").textContent).toBe("recipes");
  });
});
