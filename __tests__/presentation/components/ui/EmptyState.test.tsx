import { render, screen } from "@testing-library/react";

import EmptyState from "@/presentation/components/ui/EmptyState";

// Mock i18n
jest.mock("@/shared/i18n", () => ({
  useTranslation: jest.fn((namespace: string) => {
    if (namespace === "common.emptyState") {
      return (key: string) => {
        const translations: Record<string, string> = {
          defaultTitle: "Aucun élément",
          defaultMessage: "Il n'y a pas encore d'éléments à afficher.",
        };
        return translations[key] || key;
      };
    }
    return (key: string) => key;
  }),
}));

describe("EmptyState Component", () => {
  it("should render title", () => {
    // Arrange & Act
    render(<EmptyState title="No items" />);

    // Assert
    const heading = screen.getByRole("heading", {
      level: 2,
      name: /no items/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it("should render custom message when provided", () => {
    // Arrange & Act
    render(<EmptyState title="No items" message="Custom message" />);

    // Assert
    const message = screen.getByText("Custom message");
    expect(message).toBeInTheDocument();
  });

  it("should render default message when message is not provided", () => {
    // Arrange & Act
    render(<EmptyState title="No items" />);

    // Assert
    const message = screen.getByText(
      /il n'y a pas encore d'éléments à afficher/i
    );
    expect(message).toBeInTheDocument();
  });

  it("should render action when provided", () => {
    // Arrange & Act
    render(
      <EmptyState title="No items" action={<button>Create Item</button>} />
    );

    // Assert
    const actionButton = screen.getByRole("button", { name: /create item/i });
    expect(actionButton).toBeInTheDocument();
  });

  it("should not render action when not provided", () => {
    // Arrange & Act
    render(<EmptyState title="No items" />);

    // Assert
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should have correct accessibility attributes", () => {
    // Arrange & Act
    render(<EmptyState title="No items" />);

    // Assert
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("should use custom aria-label when provided", () => {
    // Arrange & Act
    render(
      <EmptyState
        title="No items"
        ariaLabel="Custom empty state label"
      />
    );

    // Assert
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Custom empty state label");
  });

  it("should use title as aria-label when aria-label is not provided", () => {
    // Arrange & Act
    render(<EmptyState title="No items" />);

    // Assert
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "No items");
  });

  it("should apply custom className", () => {
    // Arrange & Act
    const { container } = render(
      <EmptyState title="No items" className="custom-class" />
    );

    // Assert
    const status = container.querySelector(".custom-class");
    expect(status).toBeInTheDocument();
  });

  it("should render without message when message is empty string", () => {
    // Arrange & Act
    render(<EmptyState title="No items" message="" />);

    // Assert
    // Should still render default message (empty string is falsy, so default is used)
    const message = screen.getByText(
      /il n'y a pas encore d'éléments à afficher/i
    );
    expect(message).toBeInTheDocument();
  });

  it("should render icon when provided", () => {
    // Arrange & Act
    const TestIcon = () => <svg data-testid="test-icon" />;
    render(<EmptyState title="No items" icon={<TestIcon />} />);

    // Assert
    const icon = screen.getByTestId("test-icon");
    expect(icon).toBeInTheDocument();
    const iconContainer = icon.closest('[aria-hidden="true"]');
    expect(iconContainer).toBeInTheDocument();
  });

  it("should not render icon when not provided", () => {
    // Arrange & Act
    render(<EmptyState title="No items" />);

    // Assert
    const status = screen.getByRole("status");
    const iconContainer = status.querySelector('[aria-hidden="true"]');
    expect(iconContainer).toBeNull();
  });

  it("should associate title and message via aria-describedby", () => {
    // Arrange & Act
    render(<EmptyState title="No items" message="Custom message" />);

    // Assert
    const status = screen.getByRole("status");
    const describedBy = status.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain("a11y-empty-state-title");
    expect(describedBy).toContain("a11y-empty-state-message");
  });

  it("should have accessibility ID generated", () => {
    // Arrange & Act
    render(<EmptyState title="No items" />);

    // Assert
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("id", "a11y-empty-state");
  });

  it("should have title and message IDs for accessibility", () => {
    // Arrange & Act
    render(<EmptyState title="No items" message="Custom message" />);

    // Assert
    const title = screen.getByRole("heading", { level: 2 });
    expect(title).toHaveAttribute("id", "a11y-empty-state-title");

    const message = screen.getByText("Custom message");
    expect(message).toHaveAttribute("id", "a11y-empty-state-message");
  });
});
