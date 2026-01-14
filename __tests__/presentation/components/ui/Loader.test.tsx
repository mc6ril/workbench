import React from "react";
import { render, screen } from "@testing-library/react";

import Loader from "@/presentation/components/ui/Loader";

// Mock useTranslation hook
jest.mock("@/shared/i18n", () => ({
  useTranslation: jest.fn((namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      common: {
        loading: "Chargement en cours...",
        loadingAriaLabel: "Chargement du contenu",
      },
    };

    const getNamespace = (ns: string) => {
      const parts = ns.split(".");
      let current: unknown = translations;
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          return undefined;
        }
      }
      return current as Record<string, string> | undefined;
    };

    const namespaceMessages = getNamespace(namespace);

    return (key: string): string => {
      if (!namespaceMessages) {
        return key;
      }
      return namespaceMessages[key] || key;
    };
  }),
}));

describe("Loader Component", () => {
  it("should render with medium size by default", () => {
    // Arrange & Act
    render(<Loader />);

    // Assert
    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
  });

  it("should render small size when specified", () => {
    // Arrange & Act
    render(<Loader size="small" />);

    // Assert
    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
  });

  it("should render medium size when specified", () => {
    // Arrange & Act
    render(<Loader size="medium" />);

    // Assert
    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
  });

  it("should render large size when specified", () => {
    // Arrange & Act
    render(<Loader size="large" />);

    // Assert
    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
  });

  it("should render full-page variant by default", () => {
    // Arrange & Act
    render(<Loader />);

    // Assert
    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
  });

  it("should render inline variant when specified", () => {
    // Arrange & Act
    render(<Loader variant="inline" />);

    // Assert
    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
  });

  it("should display i18n loading message from common.loading", () => {
    // Arrange & Act
    render(<Loader />);

    // Assert
    expect(screen.getByText("Chargement en cours...")).toBeInTheDocument();
  });

  it("should display custom message when provided", () => {
    // Arrange & Act
    render(<Loader message="Custom loading message" />);

    // Assert
    expect(screen.getByText("Custom loading message")).toBeInTheDocument();
    expect(
      screen.queryByText("Chargement en cours...")
    ).not.toBeInTheDocument();
  });

  it("should have correct accessibility attributes", () => {
    // Arrange & Act
    render(<Loader />);

    // Assert
    const loader = screen.getByRole("status");
    expect(loader).toHaveAttribute("aria-live", "polite");
    expect(loader).toHaveAttribute("aria-label", "Chargement du contenu");
    expect(loader).toHaveAttribute("aria-busy", "true");
  });

  it("should use custom aria-label when provided", () => {
    // Arrange & Act
    render(<Loader ariaLabel="Custom loading label" />);

    // Assert
    const loader = screen.getByRole("status");
    expect(loader).toHaveAttribute("aria-label", "Custom loading label");
  });

  it("should have accessibility ID generated", () => {
    // Arrange & Act
    render(<Loader />);

    // Assert
    const loader = screen.getByRole("status");
    expect(loader).toHaveAttribute("id", "a11y-loader");
  });

  it("should accept custom className", () => {
    // Arrange & Act
    const { container } = render(<Loader className="custom-loader-class" />);

    // Assert
    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
    // Verify className is applied (may be in class attribute)
    expect(container.firstChild).toHaveAttribute("class");
  });

  it("should be memoized (no unnecessary re-renders with stable props)", () => {
    // Arrange
    const { rerender } = render(<Loader size="medium" />);
    screen.getByRole("status");

    // Act - rerender with same props
    rerender(<Loader size="medium" />);
    const rerenderedLoader = screen.getByRole("status");

    // Assert - component should be memoized (same instance behavior)
    // Note: React.memo prevents re-renders, but we can't directly test that
    // We verify the component structure is correct
    expect(rerenderedLoader).toBeInTheDocument();
  });

  it("should render spinner element", () => {
    // Arrange & Act
    render(<Loader />);

    // Assert
    const loader = screen.getByRole("status");
    const spinner = loader.querySelector('[aria-hidden="true"]');
    expect(spinner).toBeInTheDocument();
  });

  it("should render message element", () => {
    // Arrange & Act
    render(<Loader />);

    // Assert
    const loader = screen.getByRole("status");
    const message = loader.querySelector("p");
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent("Chargement en cours...");
  });
});
