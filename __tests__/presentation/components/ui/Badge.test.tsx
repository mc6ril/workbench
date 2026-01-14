import { render, screen } from "@testing-library/react";

import Badge from "@/presentation/components/ui/Badge";

describe("Badge Component", () => {
  it("should render label", () => {
    // Arrange & Act
    render(<Badge label="Active" />);

    // Assert
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should apply default variant", () => {
    // Arrange & Act
    const { container } = render(<Badge label="Status" />);

    // Assert
    expect(container.firstChild).toHaveClass("badge--default");
  });

  it("should apply variant class", () => {
    // Arrange & Act
    const { container } = render(<Badge label="Success" variant="success" />);

    // Assert
    expect(container.firstChild).toHaveClass("badge--success");
  });

  it("should apply all variant classes", () => {
    // Arrange & Act
    const { container: warningContainer } = render(
      <Badge label="Warning" variant="warning" />
    );
    const { container: errorContainer } = render(
      <Badge label="Error" variant="error" />
    );
    const { container: infoContainer } = render(
      <Badge label="Info" variant="info" />
    );

    // Assert
    expect(warningContainer.firstChild).toHaveClass("badge--warning");
    expect(errorContainer.firstChild).toHaveClass("badge--error");
    expect(infoContainer.firstChild).toHaveClass("badge--info");
  });

  it("should apply default size", () => {
    // Arrange & Act
    const { container } = render(<Badge label="Status" />);

    // Assert
    expect(container.firstChild).toHaveClass("badge--medium");
  });

  it("should apply size class", () => {
    // Arrange & Act
    const { container } = render(<Badge label="Status" size="large" />);

    // Assert
    expect(container.firstChild).toHaveClass("badge--large");
  });

  it("should apply all size classes", () => {
    // Arrange & Act
    const { container: smallContainer } = render(
      <Badge label="Small" size="small" />
    );
    const { container: largeContainer } = render(
      <Badge label="Large" size="large" />
    );

    // Assert
    expect(smallContainer.firstChild).toHaveClass("badge--small");
    expect(largeContainer.firstChild).toHaveClass("badge--large");
  });

  it("should have role status", () => {
    // Arrange & Act
    render(<Badge label="Status" />);

    // Assert
    expect(screen.getByText("Status")).toHaveAttribute("role", "status");
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    render(<Badge label="Status" ariaLabel="Current status" />);

    // Assert
    expect(screen.getByText("Status")).toHaveAttribute(
      "aria-label",
      "Current status"
    );
  });

  it("should use label as aria-label when not provided", () => {
    // Arrange & Act
    render(<Badge label="Active Status" />);

    // Assert
    expect(screen.getByText("Active Status")).toHaveAttribute(
      "aria-label",
      "Active Status"
    );
  });

  it("should apply custom className", () => {
    // Arrange & Act
    const { container } = render(
      <Badge label="Status" className="custom-class" />
    );

    // Assert
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
