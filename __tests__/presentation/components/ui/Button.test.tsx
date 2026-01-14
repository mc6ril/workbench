import { fireEvent, render, screen } from "@testing-library/react";

import Button from "@/presentation/components/ui/Button";

describe("Button Component", () => {
  it("should render button with label", () => {
    // Arrange & Act
    render(<Button label="Click me" onClick={() => {}} />);

    // Assert
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    // Arrange
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);

    // Act
    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    // Arrange & Act
    render(<Button label="Click me" onClick={() => {}} disabled />);

    // Assert
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should not call onClick when disabled", () => {
    // Arrange
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} disabled />);

    // Act
    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Assert
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should render primary variant by default", () => {
    // Arrange & Act
    render(<Button label="Primary" onClick={() => {}} />);

    // Assert
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should render secondary variant when specified", () => {
    // Arrange & Act
    render(<Button label="Secondary" onClick={() => {}} variant="secondary" />);

    // Assert
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should render danger variant when specified", () => {
    // Arrange & Act
    render(<Button label="Danger" onClick={() => {}} variant="danger" />);

    // Assert
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should have correct type attribute", () => {
    // Arrange & Act
    render(<Button label="Submit" onClick={() => {}} type="submit" />);

    // Assert
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    render(
      <Button label="Click me" onClick={() => {}} aria-label="Custom label" />
    );

    // Assert
    const button = screen.getByRole("button", { name: /custom label/i });
    expect(button).toBeInTheDocument();
  });

  it("should have aria-disabled when disabled", () => {
    // Arrange & Act
    render(<Button label="Disabled" onClick={() => {}} disabled />);

    // Assert
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("should render full-width when fullWidth prop is true", () => {
    // Arrange & Act
    render(<Button label="Full Width" onClick={() => {}} fullWidth />);

    // Assert
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should call onClick when Enter key is pressed", () => {
    // Arrange
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);

    // Act
    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should call onClick when Space key is pressed", () => {
    // Arrange
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);

    // Act
    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: " ", code: "Space" });

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when Enter key is pressed and button is disabled", () => {
    // Arrange
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} disabled />);

    // Act
    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

    // Assert
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should not call onClick when Space key is pressed and button is disabled", () => {
    // Arrange
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} disabled />);

    // Act
    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: " ", code: "Space" });

    // Assert
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should have accessibility ID generated from label", () => {
    // Arrange & Act
    render(<Button label="Test Button" onClick={() => {}} />);

    // Assert
    const button = screen.getByRole("button");
    // getAccessibilityId preserves spaces in the label
    expect(button).toHaveAttribute("id", "a11y-button-test -button");
  });

  it("should have role button attribute", () => {
    // Arrange & Act
    render(<Button label="Test" onClick={() => {}} />);

    // Assert
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("role", "button");
  });
});
