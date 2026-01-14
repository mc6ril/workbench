import { fireEvent,render, screen } from "@testing-library/react";

import Checkbox from "@/presentation/components/ui/Checkbox";

describe("Checkbox Component", () => {
  it("should render checkbox with label", () => {
    // Arrange & Act
    const handleChange = jest.fn();
    render(<Checkbox label="I agree" name="agree" onChange={handleChange} />);

    // Assert
    expect(screen.getByLabelText(/i agree/i)).toBeInTheDocument();
  });

  it("should be checked when checked prop is true", () => {
    // Arrange & Act
    const handleChange = jest.fn();
    render(
      <Checkbox label="I agree" name="agree" checked onChange={handleChange} />
    );

    // Assert
    const checkbox = screen.getByLabelText(/i agree/i) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it("should not be checked when checked prop is false", () => {
    // Arrange & Act
    const handleChange = jest.fn();
    render(
      <Checkbox
        label="I agree"
        name="agree"
        checked={false}
        onChange={handleChange}
      />
    );

    // Assert
    const checkbox = screen.getByLabelText(/i agree/i) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it("should call onChange when clicked", () => {
    // Arrange
    const handleChange = jest.fn();
    render(
      <Checkbox label="I agree" name="agree" onChange={handleChange} />
    );

    // Act
    const checkbox = screen.getByLabelText(/i agree/i);
    fireEvent.click(checkbox);

    // Assert
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("should have aria-checked when checked", () => {
    // Arrange & Act
    const handleChange = jest.fn();
    render(
      <Checkbox label="I agree" name="agree" checked onChange={handleChange} />
    );

    // Assert
    const checkbox = screen.getByLabelText(/i agree/i);
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("should have aria-checked false when not checked", () => {
    // Arrange & Act
    const handleChange = jest.fn();
    render(
      <Checkbox
        label="I agree"
        name="agree"
        checked={false}
        onChange={handleChange}
      />
    );

    // Assert
    const checkbox = screen.getByLabelText(/i agree/i);
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("should have aria-checked mixed when indeterminate", () => {
    // Arrange & Act
    const handleChange = jest.fn();
    render(
      <Checkbox
        label="Select all"
        name="selectAll"
        indeterminate
        onChange={handleChange}
      />
    );

    // Assert
    const checkbox = screen.getByLabelText(/select all/i) as HTMLInputElement;
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");
    expect(checkbox.indeterminate).toBe(true);
  });

  it("should have aria-required when required prop is true", () => {
    // Arrange & Act
    const handleChange = jest.fn();
    render(
      <Checkbox
        label="I agree"
        name="agree"
        required
        onChange={handleChange}
      />
    );

    // Assert
    const checkbox = screen.getByLabelText(/i agree/i);
    expect(checkbox).toHaveAttribute("aria-required", "true");
  });

  it("should have aria-disabled when disabled prop is true", () => {
    // Arrange & Act
    render(<Checkbox label="I agree" name="agree" disabled />);

    // Assert
    const checkbox = screen.getByLabelText(/i agree/i);
    expect(checkbox).toHaveAttribute("aria-disabled", "true");
    expect(checkbox).toBeDisabled();
  });

  it("should link label with checkbox using htmlFor and id", () => {
    // Arrange & Act
    const handleChange = jest.fn();
    render(
      <Checkbox
        label="I agree"
        name="agree"
        id="agree-checkbox"
        onChange={handleChange}
      />
    );

    // Assert
    const label = screen.getByText(/i agree/i);
    const checkbox = screen.getByLabelText(/i agree/i);
    expect(label.closest("label")).toHaveAttribute("for", "agree-checkbox");
    expect(checkbox).toHaveAttribute("id", "agree-checkbox");
  });

  it("should generate id automatically if not provided", () => {
    // Arrange & Act
    const handleChange = jest.fn();
    render(
      <Checkbox
        label="Terms and conditions"
        name="terms"
        onChange={handleChange}
      />
    );

    // Assert
    const checkbox = screen.getByLabelText(/terms and conditions/i);
    // getAccessibilityId preserves spaces in the label
    expect(checkbox).toHaveAttribute(
      "id",
      "a11y-checkbox-terms and conditions"
    );
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    render(
      <Checkbox
        label="I agree"
        name="agree"
        aria-label="Custom checkbox label"
      />
    );

    // Assert
    const checkbox = screen.getByLabelText(/custom checkbox label/i);
    expect(checkbox).toBeInTheDocument();
  });

  it("should toggle on Space key press", () => {
    // Arrange
    const handleChange = jest.fn();
    render(
      <Checkbox label="I agree" name="agree" onChange={handleChange} />
    );

    // Act
    const checkbox = screen.getByLabelText(/i agree/i);
    fireEvent.keyDown(checkbox, { key: " ", code: "Space" });

    // Assert
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("should not toggle on Space key when disabled", () => {
    // Arrange
    const handleChange = jest.fn();
    render(
      <Checkbox
        label="I agree"
        name="agree"
        disabled
        onChange={handleChange}
      />
    );

    // Act
    const checkbox = screen.getByLabelText(/i agree/i);
    fireEvent.keyDown(checkbox, { key: " ", code: "Space" });

    // Assert
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("should update indeterminate state when prop changes", () => {
    // Arrange
    const handleChange = jest.fn();
    const { rerender } = render(
      <Checkbox
        label="Select all"
        name="selectAll"
        indeterminate={false}
        onChange={handleChange}
      />
    );
    const checkbox = screen.getByLabelText(/select all/i) as HTMLInputElement;

    // Act
    rerender(
      <Checkbox
        label="Select all"
        name="selectAll"
        indeterminate
        onChange={handleChange}
      />
    );

    // Assert
    expect(checkbox.indeterminate).toBe(true);
  });
});
