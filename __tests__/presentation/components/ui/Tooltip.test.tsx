import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import Tooltip from "@/presentation/components/ui/Tooltip";

describe("Tooltip Component", () => {
  beforeEach(() => {
    // Create portal root
    const portalRoot = document.createElement("div");
    portalRoot.setAttribute("id", "__next");
    document.body.appendChild(portalRoot);
  });

  afterEach(() => {
    const portalRoot = document.getElementById("__next");
    if (portalRoot) {
      document.body.removeChild(portalRoot);
    }
  });

  it("should render trigger element", () => {
    // Arrange & Act
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    // Assert
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("should show tooltip on mouse enter", async () => {
    // Arrange
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    // Act
    const trigger = screen.getByText("Hover me");
    fireEvent.mouseEnter(trigger);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Tooltip text")).toBeInTheDocument();
    });
  });

  it("should hide tooltip on mouse leave", async () => {
    // Arrange
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    // Act
    const trigger = screen.getByText("Hover me");
    fireEvent.mouseEnter(trigger);
    await waitFor(() => {
      expect(screen.getByText("Tooltip text")).toBeInTheDocument();
    });

    fireEvent.mouseLeave(trigger);

    // Assert
    await waitFor(() => {
      expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
    });
  });

  it("should show tooltip on focus", async () => {
    // Arrange
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );

    // Act
    const trigger = screen.getByText("Focus me");
    fireEvent.focus(trigger);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Tooltip text")).toBeInTheDocument();
    });
  });

  it("should have role tooltip", async () => {
    // Arrange
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    // Act
    const trigger = screen.getByText("Hover me");
    fireEvent.mouseEnter(trigger);

    // Assert
    await waitFor(() => {
      const tooltip = screen.getByText("Tooltip text");
      expect(tooltip).toHaveAttribute("role", "tooltip");
    });
  });

  it("should link trigger to tooltip via aria-describedby", async () => {
    // Arrange
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    // Act
    const trigger = screen.getByText("Hover me");
    fireEvent.mouseEnter(trigger);

    // Assert
    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-describedby");
    });
  });
});
