import { render, screen } from "@testing-library/react";

import NavigationItem from "@/presentation/components/ui/NavigationItem";

// Mock Next.js Link
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock useTranslation
jest.mock("@/shared/i18n", () => ({
  useTranslation: (namespace: string) => (key: string) => {
    if (namespace === "common" && key === "dashboard") {
      return "Dashboard";
    }
    return key;
  },
}));

describe("NavigationItem Component", () => {
  it("should render label", () => {
    // Arrange & Act
    render(<NavigationItem href="/test" label="Test" />);

    // Assert
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should render icon when provided", () => {
    // Arrange & Act
    render(
      <NavigationItem href="/test" label="Test" icon={<span>Icon</span>} />
    );

    // Assert
    expect(screen.getByText("Icon")).toBeInTheDocument();
  });

  it("should apply active class when active", () => {
    // Arrange & Act
    const { container } = render(
      <NavigationItem href="/test" label="Test" active />
    );

    // Assert
    expect(container.firstChild).toHaveClass("navigation-item--active");
  });

  it("should have aria-current when active", () => {
    // Arrange & Act
    render(<NavigationItem href="/test" label="Test" active />);

    // Assert
    const link = screen.getByText("Test").closest("a");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("should not have aria-current when not active", () => {
    // Arrange & Act
    render(<NavigationItem href="/test" label="Test" />);

    // Assert
    const link = screen.getByText("Test").closest("a");
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("should call onClick when provided", () => {
    // Arrange
    const handleClick = jest.fn();
    render(
      <NavigationItem href="/test" label="Test" onClick={handleClick} />
    );

    // Act
    const link = screen.getByText("Test").closest("a");
    link?.click();

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    render(
      <NavigationItem href="/test" label="Test" ariaLabel="Custom label" />
    );

    // Assert
    const link = screen.getByText("Test").closest("a");
    expect(link).toHaveAttribute("aria-label", "Custom label");
  });

  it("should translate label when using i18n key", () => {
    // Arrange & Act
    render(<NavigationItem href="/dashboard" label="common.dashboard" />);

    // Assert
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
