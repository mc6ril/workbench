import { fireEvent, render, screen } from "@testing-library/react";

import ErrorMessage from "@/presentation/components/ui/ErrorMessage";

// Mock i18n
jest.mock("@/shared/i18n", () => ({
  useTranslation: jest.fn((namespace: string) => {
    if (namespace === "errors") {
      return (key: string) => {
        const translations: Record<string, string> = {
          generic: "Une erreur s'est produite",
          retry: "Réessayer",
          retryAriaLabel: "Réessayer l'opération",
        };
        return translations[key] || key;
      };
    }
    return (key: string) => key;
  }),
}));

// Mock getErrorMessage
jest.mock("@/shared/i18n/errorMessages", () => ({
  getErrorMessage: jest.fn(
    (
      error: { code?: string } | null | undefined,
      tErrors: (key: string) => string
    ) => {
      if (!error || !error.code) {
        return tErrors("generic");
      }
      return `Error: ${error.code}`;
    }
  ),
}));

describe("ErrorMessage Component", () => {
  it("should render error message when error is provided", () => {
    // Arrange & Act
    render(<ErrorMessage error={{ code: "TEST_ERROR" }} />);

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  it("should not render when error is null", () => {
    // Arrange & Act
    const { container } = render(<ErrorMessage error={null} />);

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it("should not render when error is undefined", () => {
    // Arrange & Act
    const { container } = render(<ErrorMessage error={undefined} />);

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it("should display error message using getErrorMessage", () => {
    // Arrange & Act
    render(<ErrorMessage error={{ code: "TEST_ERROR" }} />);

    // Assert
    const errorText = screen.getByText(/error: test_error/i);
    expect(errorText).toBeInTheDocument();
  });

  it("should render retry button when onRetry is provided", () => {
    // Arrange
    const handleRetry = jest.fn();

    // Act
    render(
      <ErrorMessage error={{ code: "TEST_ERROR" }} onRetry={handleRetry} />
    );

    // Assert
    const retryButton = screen.getByRole("button", { name: /réessayer/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("should not render retry button when onRetry is not provided", () => {
    // Arrange & Act
    render(<ErrorMessage error={{ code: "TEST_ERROR" }} />);

    // Assert
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should call onRetry when retry button is clicked", () => {
    // Arrange
    const handleRetry = jest.fn();
    render(
      <ErrorMessage error={{ code: "TEST_ERROR" }} onRetry={handleRetry} />
    );

    // Act
    const retryButton = screen.getByRole("button", { name: /réessayer/i });
    fireEvent.click(retryButton);

    // Assert
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("should have correct accessibility attributes", () => {
    // Arrange & Act
    render(<ErrorMessage error={{ code: "TEST_ERROR" }} />);

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("role", "alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  it("should use custom aria-label when provided", () => {
    // Arrange & Act
    render(
      <ErrorMessage
        error={{ code: "TEST_ERROR" }}
        aria-label="Custom error label"
      />
    );

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-label", "Custom error label");
  });

  it("should use error message as aria-label when aria-label is not provided", () => {
    // Arrange & Act
    render(<ErrorMessage error={{ code: "TEST_ERROR" }} />);

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-label");
  });

  it("should apply custom className", () => {
    // Arrange & Act
    const { container } = render(
      <ErrorMessage error={{ code: "TEST_ERROR" }} className="custom-class" />
    );

    // Assert
    const alert = container.querySelector(".custom-class");
    expect(alert).toBeInTheDocument();
  });
});
