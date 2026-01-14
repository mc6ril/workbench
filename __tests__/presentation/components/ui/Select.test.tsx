import { render, screen } from "@testing-library/react";

import Select from "@/presentation/components/ui/Select";

const mockOptions = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

describe("Select Component", () => {
  it("should render select with label", () => {
    // Arrange & Act
    render(<Select label="Status" options={mockOptions} />);

    // Assert
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  it("should render all options", () => {
    // Arrange & Act
    render(<Select label="Status" options={mockOptions} />);

    // Assert
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("should display error message when error prop is provided", () => {
    // Arrange & Act
    render(
      <Select label="Status" options={mockOptions} error="Status is required" />
    );

    // Assert
    expect(screen.getByText("Status is required")).toBeInTheDocument();
    expect(screen.getByText("Status is required")).toHaveAttribute(
      "role",
      "alert"
    );
  });

  it("should have aria-invalid when error is present", () => {
    // Arrange & Act
    render(
      <Select label="Status" options={mockOptions} error="Invalid status" />
    );

    // Assert
    const select = screen.getByLabelText(/status/i);
    expect(select).toHaveAttribute("aria-invalid", "true");
  });

  it("should not have aria-invalid when no error", () => {
    // Arrange & Act
    render(<Select label="Status" options={mockOptions} />);

    // Assert
    const select = screen.getByLabelText(/status/i);
    expect(select).toHaveAttribute("aria-invalid", "false");
  });

  it("should show required indicator when required prop is true", () => {
    // Arrange & Act
    render(<Select label="Status" options={mockOptions} required />);

    // Assert
    const label = screen.getByText(/status/i);
    expect(label).toBeInTheDocument();
  });

  it("should have aria-required when required prop is true", () => {
    // Arrange & Act
    render(<Select label="Status" options={mockOptions} required />);

    // Assert
    const select = screen.getByLabelText(/status/i);
    expect(select).toHaveAttribute("aria-required", "true");
  });

  it("should link label with select using htmlFor and id", () => {
    // Arrange & Act
    render(
      <Select label="Status" options={mockOptions} id="status-select" />
    );

    // Assert
    const label = screen.getByText(/status/i);
    const select = screen.getByLabelText(/status/i);
    expect(label).toHaveAttribute("for", "status-select");
    expect(select).toHaveAttribute("id", "status-select");
  });

  it("should generate id automatically if not provided", () => {
    // Arrange & Act
    render(<Select label="Category" options={mockOptions} />);

    // Assert
    const select = screen.getByLabelText(/category/i);
    expect(select).toHaveAttribute("id", "a11y-select-category");
  });

  it("should associate error message with select via aria-describedby", () => {
    // Arrange & Act
    render(
      <Select
        label="Status"
        options={mockOptions}
        error="Invalid status"
        id="status"
      />
    );

    // Assert
    const select = screen.getByLabelText(/status/i);
    const errorId = "a11y-select-status-error";
    expect(select).toHaveAttribute("aria-describedby", expect.stringContaining(errorId));
    expect(screen.getByText("Invalid status")).toHaveAttribute("id", errorId);
  });

  it("should display helper text when provided and no error", () => {
    // Arrange & Act
    render(
      <Select
        label="Status"
        options={mockOptions}
        helperText="Select a status"
      />
    );

    // Assert
    expect(screen.getByText("Select a status")).toBeInTheDocument();
  });

  it("should not display helper text when error is present", () => {
    // Arrange & Act
    render(
      <Select
        label="Status"
        options={mockOptions}
        error="Status is required"
        helperText="Select a status"
      />
    );

    // Assert
    expect(screen.getByText("Status is required")).toBeInTheDocument();
    expect(screen.queryByText("Select a status")).not.toBeInTheDocument();
  });

  it("should display placeholder option when placeholder is provided and no value", () => {
    // Arrange & Act
    render(
      <Select
        label="Status"
        options={mockOptions}
        placeholder="Choose a status"
      />
    );

    // Assert
    expect(screen.getByText("Choose a status")).toBeInTheDocument();
  });

  it("should not display placeholder when value is selected", () => {
    // Arrange & Act
    render(
      <Select
        label="Status"
        options={mockOptions}
        placeholder="Choose a status"
        value="option1"
      />
    );

    // Assert
    expect(screen.queryByText("Choose a status")).not.toBeInTheDocument();
  });

  it("should have aria-disabled when disabled prop is true", () => {
    // Arrange & Act
    render(<Select label="Status" options={mockOptions} disabled />);

    // Assert
    const select = screen.getByLabelText(/status/i);
    expect(select).toHaveAttribute("aria-disabled", "true");
    expect(select).toBeDisabled();
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    render(
      <Select
        label="Status"
        options={mockOptions}
        aria-label="Custom status label"
      />
    );

    // Assert
    const select = screen.getByLabelText(/custom status label/i);
    expect(select).toBeInTheDocument();
  });

  it("should set value correctly", () => {
    // Arrange & Act
    render(
      <Select label="Status" options={mockOptions} value="option2" />
    );

    // Assert
    const select = screen.getByLabelText(/status/i) as HTMLSelectElement;
    expect(select.value).toBe("option2");
  });
});
