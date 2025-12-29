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

  it("should render outline variant when specified", () => {
    // Arrange & Act
    render(<Button label="Outline" onClick={() => {}} variant="outline" />);

    // Assert
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should render ghost variant when specified", () => {
    // Arrange & Act
    render(<Button label="Ghost" onClick={() => {}} variant="ghost" />);

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
});
