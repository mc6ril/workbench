import { fireEvent, render, screen } from "@testing-library/react";

import ErrorMessage from "@/presentation/components/ui/ErrorMessage";

// Mock i18n
jest.mock("@/shared/i18n", () => ({
  useTranslation: jest.fn((namespace: string) => {
    if (namespace === "common") {
      return (key: string) => {
        const translations: Record<string, string> = {
          dismiss: "Fermer",
          dismissAriaLabel: "Fermer le message d'erreur",
        };
        return translations[key] || key;
      };
    }
    return (key: string) => key;
  }),
}));

describe("ErrorMessage Component", () => {
  it("should render error message when message is provided", () => {
    // Arrange & Act
    render(<ErrorMessage message="An error occurred" />);

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });

  it("should display title when provided", () => {
    // Arrange & Act
    render(<ErrorMessage message="An error occurred" title="Error Title" />);

    // Assert
    expect(screen.getByText("Error Title")).toBeInTheDocument();
    const title = screen.getByText("Error Title");
    expect(title.tagName).toBe("H3");
  });

  it("should not display title when not provided", () => {
    // Arrange & Act
    render(<ErrorMessage message="An error occurred" />);

    // Assert
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("should render dismiss button when onDismiss is provided", () => {
    // Arrange
    const handleDismiss = jest.fn();

    // Act
    render(
      <ErrorMessage message="An error occurred" onDismiss={handleDismiss} />
    );

    // Assert
    const dismissButton = screen.getByRole("button", { name: /fermer/i });
    expect(dismissButton).toBeInTheDocument();
  });

  it("should not render dismiss button when onDismiss is not provided", () => {
    // Arrange & Act
    render(<ErrorMessage message="An error occurred" />);

    // Assert
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should call onDismiss when dismiss button is clicked", () => {
    // Arrange
    const handleDismiss = jest.fn();
    render(
      <ErrorMessage message="An error occurred" onDismiss={handleDismiss} />
    );

    // Act
    const dismissButton = screen.getByRole("button", { name: /fermer/i });
    fireEvent.click(dismissButton);

    // Assert
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it("should have correct accessibility attributes", () => {
    // Arrange & Act
    render(<ErrorMessage message="An error occurred" />);

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("role", "alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  it("should use custom aria-label when provided", () => {
    // Arrange & Act
    render(
      <ErrorMessage
        message="An error occurred"
        ariaLabel="Custom error label"
      />
    );

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-label", "Custom error label");
  });

  it("should use message as aria-label when aria-label is not provided", () => {
    // Arrange & Act
    render(<ErrorMessage message="An error occurred" />);

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-label", "An error occurred");
  });

  it("should associate title and message via aria-describedby when title exists", () => {
    // Arrange & Act
    render(<ErrorMessage message="An error occurred" title="Error Title" />);

    // Assert
    const alert = screen.getByRole("alert");
    const describedBy = alert.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain("a11y-error-message-title");
    expect(describedBy).toContain("a11y-error-message-text");
  });

  it("should have error icon with aria-hidden", () => {
    // Arrange & Act
    render(<ErrorMessage message="An error occurred" />);

    // Assert
    const icon = screen.getByRole("alert").querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("should have accessibility ID generated", () => {
    // Arrange & Act
    render(<ErrorMessage message="An error occurred" />);

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("id", "a11y-error-message");
  });

  it("should apply custom className", () => {
    // Arrange & Act
    const { container } = render(
      <ErrorMessage message="An error occurred" className="custom-class" />
    );

    // Assert
    const alert = container.querySelector(".custom-class");
    expect(alert).toBeInTheDocument();
  });
});
