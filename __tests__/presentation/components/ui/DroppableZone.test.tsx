import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";

import DroppableZone from "@/presentation/components/ui/DroppableZone";

describe("DroppableZone Component", () => {
  it("should render children", () => {
    // Arrange & Act
    render(
      <DndContext>
        <DroppableZone id="zone-1">
          <div>Drop Zone Content</div>
        </DroppableZone>
      </DndContext>
    );

    // Assert
    expect(screen.getByText("Drop Zone Content")).toBeInTheDocument();
  });

  it("should have role region", () => {
    // Arrange & Act
    render(
      <DndContext>
        <DroppableZone id="zone-1">
          <div>Content</div>
        </DroppableZone>
      </DndContext>
    );

    // Assert
    const zone = screen.getByText("Content").closest('[role="region"]');
    expect(zone).toBeInTheDocument();
  });

  it("should have tabIndex 0 when enabled", () => {
    // Arrange & Act
    render(
      <DndContext>
        <DroppableZone id="zone-1">
          <div>Content</div>
        </DroppableZone>
      </DndContext>
    );

    // Assert
    const zone = screen.getByText("Content").closest('[role="region"]');
    expect(zone).toHaveAttribute("tabIndex", "0");
  });

  it("should have tabIndex -1 and disabled class when disabled", () => {
    // Arrange & Act
    render(
      <DndContext>
        <DroppableZone id="zone-1" disabled>
          <div>Content</div>
        </DroppableZone>
      </DndContext>
    );

    // Assert
    const zone = screen.getByText("Content").closest('[role="region"]');
    expect(zone).toHaveAttribute("tabIndex", "-1");
    expect(zone).toHaveClass("droppable-zone--disabled");
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    render(
      <DndContext>
        <DroppableZone id="zone-1" ariaLabel="Custom drop zone">
          <div>Content</div>
        </DroppableZone>
      </DndContext>
    );

    // Assert
    const zone = screen.getByText("Content").closest('[role="region"]');
    expect(zone).toHaveAttribute("aria-label", "Custom drop zone");
  });
});
