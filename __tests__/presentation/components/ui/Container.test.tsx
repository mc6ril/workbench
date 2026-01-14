import { render, screen } from "@testing-library/react";

import Container from "@/presentation/components/ui/Container";

describe("Container Component", () => {
  it("should render children", () => {
    // Arrange & Act
    render(
      <Container>
        <div>Test Content</div>
      </Container>
    );

    // Assert
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render as div by default", () => {
    // Arrange & Act
    const { container } = render(
      <Container>
        <div>Content</div>
      </Container>
    );

    // Assert
    expect(container.firstChild?.nodeName.toLowerCase()).toBe("div");
  });

  it("should render as specified element", () => {
    // Arrange & Act
    const { container } = render(
      <Container as="main">
        <div>Content</div>
      </Container>
    );

    // Assert
    expect(container.firstChild?.nodeName.toLowerCase()).toBe("main");
  });

  it("should apply default maxWidth class", () => {
    // Arrange & Act
    const { container } = render(
      <Container>
        <div>Content</div>
      </Container>
    );

    // Assert
    expect(container.firstChild).toHaveClass("container--medium");
  });

  it("should apply custom maxWidth class", () => {
    // Arrange & Act
    const { container } = render(
      <Container maxWidth="large">
        <div>Content</div>
      </Container>
    );

    // Assert
    expect(container.firstChild).toHaveClass("container--large");
  });

  it("should apply all maxWidth variants", () => {
    // Arrange & Act
    const { container: smallContainer } = render(
      <Container maxWidth="small">
        <div>Small</div>
      </Container>
    );
    const { container: fullContainer } = render(
      <Container maxWidth="full">
        <div>Full</div>
      </Container>
    );

    // Assert
    expect(smallContainer.firstChild).toHaveClass("container--small");
    expect(fullContainer.firstChild).toHaveClass("container--full");
  });

  it("should apply custom className", () => {
    // Arrange & Act
    const { container } = render(
      <Container className="custom-class">
        <div>Content</div>
      </Container>
    );

    // Assert
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should apply custom padding style", () => {
    // Arrange & Act
    const { container } = render(
      <Container padding="2rem">
        <div>Content</div>
      </Container>
    );

    // Assert
    expect(container.firstChild).toHaveStyle({ padding: "2rem" });
  });
});
