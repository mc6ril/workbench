import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";

import DraggableItem from "@/presentation/components/ui/DraggableItem";

describe("DraggableItem Component", () => {
  it("should render children", () => {
    // Arrange & Act
    render(
      <DndContext>
        <DraggableItem id="item-1">
          <div>Draggable Content</div>
        </DraggableItem>
      </DndContext>
    );

    // Assert
    expect(screen.getByText("Draggable Content")).toBeInTheDocument();
  });

  it("should have role button", () => {
    // Arrange & Act
    render(
      <DndContext>
        <DraggableItem id="item-1">
          <div>Content</div>
        </DraggableItem>
      </DndContext>
    );

    // Assert
    const item = screen.getByText("Content").closest('[role="button"]');
    expect(item).toBeInTheDocument();
  });

  it("should have aria-grabbed attribute", () => {
    // Arrange & Act
    render(
      <DndContext>
        <DraggableItem id="item-1">
          <div>Content</div>
        </DraggableItem>
      </DndContext>
    );

    // Assert
    const item = screen.getByText("Content").closest('[role="button"]');
    expect(item).toHaveAttribute("aria-grabbed");
  });

  it("should have aria-disabled when disabled", () => {
    // Arrange & Act
    render(
      <DndContext>
        <DraggableItem id="item-1" disabled>
          <div>Content</div>
        </DraggableItem>
      </DndContext>
    );

    // Assert
    const item = screen.getByText("Content").closest('[role="button"]');
    expect(item).toHaveAttribute("aria-disabled", "true");
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    render(
      <DndContext>
        <DraggableItem id="item-1" ariaLabel="Custom draggable item">
          <div>Content</div>
        </DraggableItem>
      </DndContext>
    );

    // Assert
    const item = screen.getByText("Content").closest('[role="button"]');
    expect(item).toHaveAttribute("aria-label", "Custom draggable item");
  });
});
