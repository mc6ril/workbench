import { render, screen } from "@testing-library/react";

import Title from "@/presentation/components/ui/Title";

describe("Title Component", () => {
  it("should render with default h1 variant", () => {
    // Arrange & Act
    render(<Title>Main Title</Title>);

    // Assert
    const heading = screen.getByRole("heading", { level: 1, name: /main title/i });
    expect(heading).toBeInTheDocument();
  });

  it("should render h1 variant when specified", () => {
    // Arrange & Act
    render(<Title variant="h1">Heading 1</Title>);

    // Assert
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Heading 1");
  });

  it("should render h2 variant when specified", () => {
    // Arrange & Act
    render(<Title variant="h2">Heading 2</Title>);

    // Assert
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Heading 2");
  });

  it("should render h3 variant when specified", () => {
    // Arrange & Act
    render(<Title variant="h3">Heading 3</Title>);

    // Assert
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Heading 3");
  });

  it("should apply custom className", () => {
    // Arrange & Act
    render(<Title className="custom-class">Title</Title>);

    // Assert
    const heading = screen.getByRole("heading");
    expect(heading).toHaveClass("custom-class");
  });

  it("should apply custom id", () => {
    // Arrange & Act
    render(<Title id="main-title">Title</Title>);

    // Assert
    const heading = screen.getByRole("heading");
    expect(heading).toHaveAttribute("id", "main-title");
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    render(<Title aria-label="Main page title">Title</Title>);

    // Assert
    const heading = screen.getByRole("heading");
    expect(heading).toHaveAttribute("aria-label", "Main page title");
  });

  it("should render children correctly", () => {
    // Arrange & Act
    render(<Title>Complex <strong>Title</strong> Content</Title>);

    // Assert
    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("Complex Title Content");
    expect(heading.querySelector("strong")).toBeInTheDocument();
  });
});

