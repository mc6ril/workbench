import { render, screen } from "@testing-library/react";

import Text from "@/presentation/components/ui/Text";

describe("Text Component", () => {
  it("should render with default body variant and p tag", () => {
    // Arrange & Act
    render(<Text>Body text</Text>);

    // Assert
    const text = screen.getByText("Body text");
    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe("P");
  });

  it("should render body variant when specified", () => {
    // Arrange & Act
    render(<Text variant="body">Body text</Text>);

    // Assert
    const text = screen.getByText("Body text");
    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe("P");
  });

  it("should render small variant when specified", () => {
    // Arrange & Act
    render(<Text variant="small">Small text</Text>);

    // Assert
    const text = screen.getByText("Small text");
    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe("P");
  });

  it("should render caption variant when specified", () => {
    // Arrange & Act
    render(<Text variant="caption">Caption text</Text>);

    // Assert
    const text = screen.getByText("Caption text");
    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe("P");
  });

  it("should render as span when as prop is span", () => {
    // Arrange & Act
    render(<Text as="span">Inline text</Text>);

    // Assert
    const text = screen.getByText("Inline text");
    expect(text.tagName).toBe("SPAN");
  });

  it("should render as div when as prop is div", () => {
    // Arrange & Act
    render(<Text as="div">Div text</Text>);

    // Assert
    const text = screen.getByText("Div text");
    expect(text.tagName).toBe("DIV");
  });

  it("should apply custom className", () => {
    // Arrange & Act
    render(<Text className="custom-class">Text</Text>);

    // Assert
    const text = screen.getByText("Text");
    expect(text).toHaveClass("custom-class");
  });

  it("should apply custom id", () => {
    // Arrange & Act
    render(<Text id="text-id">Text</Text>);

    // Assert
    const text = screen.getByText("Text");
    expect(text).toHaveAttribute("id", "text-id");
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    render(<Text aria-label="Description text">Text</Text>);

    // Assert
    const text = screen.getByText("Text");
    expect(text).toHaveAttribute("aria-label", "Description text");
  });

  it("should render children correctly", () => {
    // Arrange & Act
    const { container } = render(<Text>Complex <strong>text</strong> content</Text>);

    // Assert
    const text = container.querySelector("p");
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent("Complex text content");
    expect(text?.querySelector("strong")).toBeInTheDocument();
    expect(text?.querySelector("strong")).toHaveTextContent("text");
  });
});

