import { useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";

import Input from "@/presentation/components/ui/Input";

// Helper component to test react-hook-form integration
const TestForm = ({ error }: { error?: string }) => {
  const { register } = useForm();

  return <Input label="Email" {...register("email")} error={error} required />;
};

describe("Input Component", () => {
  it("should render input with label", () => {
    // Arrange & Act
    render(<Input label="Email" />);

    // Assert
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("should display error message when error prop is provided", () => {
    // Arrange & Act
    render(<Input label="Email" error="Email is required" />);

    // Assert
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toHaveAttribute(
      "role",
      "alert"
    );
  });

  it("should have aria-invalid when error is present", () => {
    // Arrange & Act
    render(<Input label="Email" error="Invalid email" />);

    // Assert
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("should not have aria-invalid when no error", () => {
    // Arrange & Act
    render(<Input label="Email" />);

    // Assert
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("should show required indicator when required prop is true", () => {
    // Arrange & Act
    render(<Input label="Email" required />);

    // Assert
    const label = screen.getByText(/email/i);
    expect(label).toBeInTheDocument();
  });

  it("should have aria-required when required prop is true", () => {
    // Arrange & Act
    render(<Input label="Email" required />);

    // Assert
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute("aria-required", "true");
  });

  it("should link label with input using htmlFor and id", () => {
    // Arrange & Act
    render(<Input label="Email" id="email-input" />);

    // Assert
    const label = screen.getByText(/email/i);
    const input = screen.getByLabelText(/email/i);
    expect(label).toHaveAttribute("for", "email-input");
    expect(input).toHaveAttribute("id", "email-input");
  });

  it("should generate id automatically if not provided", () => {
    // Arrange & Act
    render(<Input label="Email Address" />);

    // Assert
    const input = screen.getByLabelText(/email address/i);
    // getAccessibilityId preserves spaces in the label
    expect(input).toHaveAttribute("id", "a11y-input-email -address");
  });

  it("should associate error message with input via aria-describedby", () => {
    // Arrange & Act
    render(<Input label="Email" error="Invalid email" id="email" />);

    // Assert
    const input = screen.getByLabelText(/email/i);
    const errorId = "a11y-input-email-error";
    expect(input).toHaveAttribute("aria-describedby", errorId);
    expect(screen.getByText("Invalid email")).toHaveAttribute("id", errorId);
  });

  it("should work with react-hook-form register", () => {
    // Arrange & Act
    render(<TestForm />);

    // Assert
    const input = screen.getByLabelText(/email/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("name", "email");
  });

  it("should display error from react-hook-form", () => {
    // Arrange & Act
    render(<TestForm error="Email is required" />);

    // Assert
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("should display helper text when provided and no error", () => {
    // Arrange & Act
    render(<Input label="Email" helperText="Enter your email address" />);

    // Assert
    expect(screen.getByText("Enter your email address")).toBeInTheDocument();
  });

  it("should not display helper text when error is present", () => {
    // Arrange & Act
    render(
      <Input
        label="Email"
        error="Email is required"
        helperText="Enter your email address"
      />
    );

    // Assert
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(
      screen.queryByText("Enter your email address")
    ).not.toBeInTheDocument();
  });

  it("should associate helper text with input via aria-describedby", () => {
    // Arrange & Act
    render(<Input label="Email" helperText="Enter your email" id="email" />);

    // Assert
    const input = screen.getByLabelText(/email/i);
    const helperTextId = "a11y-input-email-helper";
    expect(input).toHaveAttribute("aria-describedby", helperTextId);
    expect(screen.getByText("Enter your email")).toHaveAttribute(
      "id",
      helperTextId
    );
  });

  it("should associate both error and helper text IDs when both provided (error takes precedence)", () => {
    // Arrange & Act
    render(
      <Input
        label="Email"
        error="Email is required"
        helperText="Enter your email"
        id="email"
      />
    );

    // Assert
    const input = screen.getByLabelText(/email/i);
    const errorId = "a11y-input-email-error";
    expect(input).toHaveAttribute("aria-describedby", errorId);
    expect(screen.queryByText("Enter your email")).not.toBeInTheDocument();
  });

  it("should have aria-disabled when disabled prop is true", () => {
    // Arrange & Act
    render(<Input label="Email" disabled />);

    // Assert
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute("aria-disabled", "true");
    expect(input).toBeDisabled();
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    render(<Input label="Email" aria-label="Custom email label" />);

    // Assert
    const input = screen.getByLabelText(/custom email label/i);
    expect(input).toBeInTheDocument();
  });

  it("should support different input types", () => {
    // Arrange & Act
    render(<Input label="Email" type="email" />);
    render(<Input label="Password" type="password" />);
    render(<Input label="Number" type="number" />);

    // Assert
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/password/i)).toHaveAttribute(
      "type",
      "password"
    );
    expect(screen.getByLabelText(/number/i)).toHaveAttribute("type", "number");
  });
});
