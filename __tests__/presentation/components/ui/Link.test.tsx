import { render, screen } from "@testing-library/react";

import Link from "@/presentation/components/ui/Link";

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

describe("Link Component", () => {
  it("should render children", () => {
    // Arrange & Act
    render(<Link href="/test">Link Text</Link>);

    // Assert
    expect(screen.getByText("Link Text")).toBeInTheDocument();
  });

  it("should apply default variant", () => {
    // Arrange & Act
    const { container } = render(<Link href="/test">Link</Link>);

    // Assert
    expect(container.firstChild).toHaveClass("link--default");
  });

  it("should apply variant class", () => {
    // Arrange & Act
    const { container } = render(
      <Link href="/test" variant="primary">
        Link
      </Link>
    );

    // Assert
    expect(container.firstChild).toHaveClass("link--primary");
  });

  it("should render as Next.js Link for internal links", () => {
    // Arrange & Act
    render(<Link href="/internal">Internal Link</Link>);

    // Assert
    const link = screen.getByText("Internal Link");
    expect(link.closest("a")).toHaveAttribute("href", "/internal");
  });

  it("should render as anchor tag for external links", () => {
    // Arrange & Act
    render(
      <Link href="https://example.com" external>
        External Link
      </Link>
    );

    // Assert
    const link = screen.getByText("External Link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should add external link aria-label for external links", () => {
    // Arrange & Act
    render(
      <Link href="https://example.com" external>
        External Link
      </Link>
    );

    // Assert
    const link = screen.getByText("External Link");
    expect(link).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Opens in new tab")
    );
  });

  it("should use custom aria-label when provided", () => {
    // Arrange & Act
    render(
      <Link href="/test" ariaLabel="Custom link label">
        Link Text
      </Link>
    );

    // Assert
    const link = screen.getByText("Link Text");
    expect(link).toHaveAttribute("aria-label", "Custom link label");
  });

  it("should apply custom className", () => {
    // Arrange & Act
    const { container } = render(
      <Link href="/test" className="custom-class">
        Link
      </Link>
    );

    // Assert
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
