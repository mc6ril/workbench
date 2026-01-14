import { render, screen } from "@testing-library/react";

import Textarea from "@/presentation/components/ui/Textarea";

describe("Textarea Component", () => {
  it("should render textarea with label", () => {
    // Arrange & Act
    render(<Textarea label="Description" />);

    // Assert
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("should display error message when error prop is provided", () => {
    // Arrange & Act
    render(<Textarea label="Description" error="Description is required" />);

    // Assert
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toHaveAttribute(
      "role",
      "alert"
    );
  });

  it("should have aria-invalid when error is present", () => {
    // Arrange & Act
    render(<Textarea label="Description" error="Invalid description" />);

    // Assert
    const textarea = screen.getByLabelText(/description/i);
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("should not have aria-invalid when no error", () => {
    // Arrange & Act
    render(<Textarea label="Description" />);

    // Assert
    const textarea = screen.getByLabelText(/description/i);
    expect(textarea).toHaveAttribute("aria-invalid", "false");
  });

  it("should show required indicator when required prop is true", () => {
    // Arrange & Act
    render(<Textarea label="Description" required />);

    // Assert
    const label = screen.getByText(/description/i);
    expect(label).toBeInTheDocument();
  });

  it("should have aria-required when required prop is true", () => {
    // Arrange & Act
    render(<Textarea label="Description" required />);

    // Assert
    const textarea = screen.getByLabelText(/description/i);
    expect(textarea).toHaveAttribute("aria-required", "true");
  });

  it("should link label with textarea using htmlFor and id", () => {
    // Arrange & Act
    render(<Textarea label="Description" id="description-textarea" />);

    // Assert
    const label = screen.getByText(/description/i);
    const textarea = screen.getByLabelText(/description/i);
    expect(label).toHaveAttribute("for", "description-textarea");
    expect(textarea).toHaveAttribute("id", "description-textarea");
  });

  it("should generate id automatically if not provided", () => {
    // Arrange & Act
    render(<Textarea label="Comments" />);

    // Assert
    const textarea = screen.getByLabelText(/comments/i);
    expect(textarea).toHaveAttribute("id", "a11y-textarea-comments");
  });

  it("should associate error message with textarea via aria-describedby", () => {
    // Arrange & Act
    render(
      <Textarea label="Description" error="Invalid description" id="desc" />
    );

    // Assert
    const textarea = screen.getByLabelText(/description/i);
    const errorId = "a11y-textarea-description-error";
    expect(textarea).toHaveAttribute("aria-describedby", expect.stringContaining(errorId));
    expect(screen.getByText("Invalid description")).toHaveAttribute(
      "id",
      errorId
    );
  });

  it("should display helper text when provided and no error", () => {
    // Arrange & Act
    render(
      <Textarea label="Description" helperText="Enter a detailed description" />
    );

    // Assert
    expect(
      screen.getByText("Enter a detailed description")
    ).toBeInTheDocument();
  });

  it("should not display helper text when error is present", () => {
    // Arrange & Act
    render(
      <Textarea
        label="Description"
        error="Description is required"
        helperText="Enter a detailed description"
      />
    );

    // Assert
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(
      screen.queryByText("Enter a detailed description")
    ).not.toBeInTheDocument();
  });

  it("should display character count when maxLength is provided", () => {
    // Arrange & Act
    render(<Textarea label="Description" maxLength={100} value="Hello" />);

    // Assert
    expect(screen.getByText("5/100")).toBeInTheDocument();
  });

  it("should update character count when value changes", () => {
    // Arrange
    const { rerender } = render(
      <Textarea label="Description" maxLength={100} value="Hello" />
    );

    // Act
    rerender(<Textarea label="Description" maxLength={100} value="Hello World" />);

    // Assert
    expect(screen.getByText("11/100")).toBeInTheDocument();
  });

  it("should have aria-disabled when disabled prop is true", () => {
    // Arrange & Act
    render(<Textarea label="Description" disabled />);

    // Assert
    const textarea = screen.getByLabelText(/description/i);
    expect(textarea).toHaveAttribute("aria-disabled", "true");
    expect(textarea).toBeDisabled();
  });

  it("should use default rows value", () => {
    // Arrange & Act
    render(<Textarea label="Description" />);

    // Assert
    const textarea = screen.getByLabelText(/description/i);
    expect(textarea).toHaveAttribute("rows", "4");
  });

  it("should use custom rows value", () => {
    // Arrange & Act
    render(<Textarea label="Description" rows={10} />);

    // Assert
    const textarea = screen.getByLabelText(/description/i);
    expect(textarea).toHaveAttribute("rows", "10");
  });

  it("should set maxLength attribute", () => {
    // Arrange & Act
    render(<Textarea label="Description" maxLength={500} />);

    // Assert
    const textarea = screen.getByLabelText(/description/i);
    expect(textarea).toHaveAttribute("maxLength", "500");
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    render(<Textarea label="Description" aria-label="Custom description label" />);

    // Assert
    const textarea = screen.getByLabelText(/custom description label/i);
    expect(textarea).toBeInTheDocument();
  });
});
