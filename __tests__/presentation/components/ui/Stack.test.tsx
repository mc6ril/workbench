import { render, screen } from "@testing-library/react";

import Stack from "@/presentation/components/ui/Stack";

describe("Stack Component", () => {
  it("should render children", () => {
    // Arrange & Act
    render(
      <Stack>
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>
    );

    // Assert
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("should render as div by default", () => {
    // Arrange & Act
    const { container } = render(
      <Stack>
        <div>Content</div>
      </Stack>
    );

    // Assert
    expect(container.firstChild?.nodeName.toLowerCase()).toBe("div");
  });

  it("should render as specified element", () => {
    // Arrange & Act
    const { container } = render(
      <Stack as="section">
        <div>Content</div>
      </Stack>
    );

    // Assert
    expect(container.firstChild?.nodeName.toLowerCase()).toBe("section");
  });

  it("should apply vertical direction by default", () => {
    // Arrange & Act
    const { container } = render(
      <Stack>
        <div>Content</div>
      </Stack>
    );

    // Assert
    expect(container.firstChild).toHaveClass("stack--vertical");
  });

  it("should apply horizontal direction", () => {
    // Arrange & Act
    const { container } = render(
      <Stack direction="horizontal">
        <div>Content</div>
      </Stack>
    );

    // Assert
    expect(container.firstChild).toHaveClass("stack--horizontal");
  });

  it("should apply default spacing", () => {
    // Arrange & Act
    const { container } = render(
      <Stack>
        <div>Content</div>
      </Stack>
    );

    // Assert
    expect(container.firstChild).toHaveClass("stack--spacing-md");
  });

  it("should apply custom spacing", () => {
    // Arrange & Act
    const { container } = render(
      <Stack spacing="lg">
        <div>Content</div>
      </Stack>
    );

    // Assert
    expect(container.firstChild).toHaveClass("stack--spacing-lg");
  });

  it("should apply all spacing variants", () => {
    // Arrange & Act
    const { container: xsContainer } = render(
      <Stack spacing="xs">
        <div>XS</div>
      </Stack>
    );
    const { container: xlContainer } = render(
      <Stack spacing="xl">
        <div>XL</div>
      </Stack>
    );

    // Assert
    expect(xsContainer.firstChild).toHaveClass("stack--spacing-xs");
    expect(xlContainer.firstChild).toHaveClass("stack--spacing-xl");
  });

  it("should apply align classes", () => {
    // Arrange & Act
    const { container } = render(
      <Stack align="center">
        <div>Content</div>
      </Stack>
    );

    // Assert
    expect(container.firstChild).toHaveClass("stack--align-center");
  });

  it("should apply justify classes", () => {
    // Arrange & Act
    const { container } = render(
      <Stack justify="space-between">
        <div>Content</div>
      </Stack>
    );

    // Assert
    expect(container.firstChild).toHaveClass("stack--justify-space-between");
  });

  it("should apply custom className", () => {
    // Arrange & Act
    const { container } = render(
      <Stack className="custom-class">
        <div>Content</div>
      </Stack>
    );

    // Assert
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
