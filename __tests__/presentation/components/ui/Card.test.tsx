import { fireEvent,render, screen } from "@testing-library/react";

import Card from "@/presentation/components/ui/Card";

describe("Card Component", () => {
  it("should render children", () => {
    // Arrange & Act
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    );

    // Assert
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("should render title when provided", () => {
    // Arrange & Act
    render(
      <Card title="Card Title">
        <div>Content</div>
      </Card>
    );

    // Assert
    expect(screen.getByText("Card Title")).toBeInTheDocument();
  });

  it("should render custom title element", () => {
    // Arrange & Act
    render(
      <Card title={<h2>Custom Title</h2>}>
        <div>Content</div>
      </Card>
    );

    // Assert
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom Title").tagName).toBe("H2");
  });

  it("should render footer when provided", () => {
    // Arrange & Act
    render(
      <Card footer={<button>Action</button>}>
        <div>Content</div>
      </Card>
    );

    // Assert
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("should apply default variant", () => {
    // Arrange & Act
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    );

    // Assert
    expect(container.firstChild).toHaveClass("card--default");
  });

  it("should apply variant class", () => {
    // Arrange & Act
    const { container } = render(
      <Card variant="elevated">
        <div>Content</div>
      </Card>
    );

    // Assert
    expect(container.firstChild).toHaveClass("card--elevated");
  });

  it("should be clickable when onClick is provided", () => {
    // Arrange
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick}>
        <div>Content</div>
      </Card>
    );

    // Act
    const card = screen.getByText("Content").closest(".card");
    fireEvent.click(card!);

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should have button role when clickable", () => {
    // Arrange & Act
    render(
      <Card onClick={() => {}}>
        <div>Content</div>
      </Card>
    );

    // Assert
    const card = screen.getByText("Content").closest(".card");
    expect(card).toHaveAttribute("role", "button");
    expect(card).toHaveAttribute("tabIndex", "0");
  });

  it("should have article role when not clickable", () => {
    // Arrange & Act
    render(
      <Card>
        <div>Content</div>
      </Card>
    );

    // Assert
    const card = screen.getByText("Content").closest(".card");
    expect(card).toHaveAttribute("role", "article");
  });

  it("should trigger onClick on Enter key", () => {
    // Arrange
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick}>
        <div>Content</div>
      </Card>
    );

    // Act
    const card = screen.getByText("Content").closest(".card");
    fireEvent.keyDown(card!, { key: "Enter", code: "Enter" });

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should trigger onClick on Space key", () => {
    // Arrange
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick}>
        <div>Content</div>
      </Card>
    );

    // Act
    const card = screen.getByText("Content").closest(".card");
    fireEvent.keyDown(card!, { key: " ", code: "Space" });

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    render(
      <Card ariaLabel="Custom card label">
        <div>Content</div>
      </Card>
    );

    // Assert
    const card = screen.getByText("Content").closest(".card");
    expect(card).toHaveAttribute("aria-label", "Custom card label");
  });

  it("should apply custom className", () => {
    // Arrange & Act
    const { container } = render(
      <Card className="custom-class">
        <div>Content</div>
      </Card>
    );

    // Assert
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
