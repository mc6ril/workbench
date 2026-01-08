import { render, screen } from "@testing-library/react";

import Form from "@/presentation/components/ui/Form";

describe("Form Component", () => {
  it("should render form with children", () => {
    // Arrange & Act
    const { container } = render(
      <Form>
        <input type="text" />
      </Form>
    );

    // Assert
    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    expect(form?.querySelector("input")).toBeInTheDocument();
  });

  it("should render fieldset and legend when legend prop is provided", () => {
    // Arrange & Act
    render(
      <Form legend="Form Title">
        <input type="text" />
      </Form>
    );

    // Assert
    const legend = screen.getByText("Form Title");
    expect(legend).toBeInTheDocument();
    expect(legend.tagName).toBe("LEGEND");
    
    const fieldset = legend.closest("fieldset");
    expect(fieldset).toBeInTheDocument();
  });

  it("should not render fieldset when legend is not provided", () => {
    // Arrange & Act
    render(
      <Form>
        <input type="text" />
      </Form>
    );

    // Assert
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.queryByText(/form title/i)).not.toBeInTheDocument();
  });

  it("should display error message when error prop is provided", () => {
    // Arrange & Act
    render(
      <Form error="Form validation error">
        <input type="text" />
      </Form>
    );

    // Assert
    const error = screen.getByText("Form validation error");
    expect(error).toBeInTheDocument();
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveAttribute("aria-live", "assertive");
  });

  it("should not display error message when error prop is not provided", () => {
    // Arrange & Act
    render(
      <Form>
        <input type="text" />
      </Form>
    );

    // Assert
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("should link error message with form via aria-describedby", () => {
    // Arrange & Act
    const { container } = render(
      <Form error="Form error">
        <input type="text" />
      </Form>
    );

    // Assert
    const form = container.querySelector("form");
    expect(form).toHaveAttribute("aria-describedby", "a11y-form-error");
    
    const error = screen.getByText("Form error");
    expect(error).toHaveAttribute("id", "a11y-form-error");
  });

  it("should use aria-label when provided", () => {
    // Arrange & Act
    const { container } = render(
      <Form aria-label="Contact form">
        <input type="text" />
      </Form>
    );

    // Assert
    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute("aria-label", "Contact form");
  });

  it("should combine aria-describedby with error id", () => {
    // Arrange & Act
    const { container } = render(
      <Form error="Error" aria-describedby="custom-id">
        <input type="text" />
      </Form>
    );

    // Assert
    const form = container.querySelector("form");
    const describedBy = form?.getAttribute("aria-describedby");
    expect(describedBy).toContain("custom-id");
    expect(describedBy).toContain("a11y-form-error");
  });

  it("should apply custom className", () => {
    // Arrange & Act
    const { container } = render(
      <Form className="custom-form-class">
        <input type="text" />
      </Form>
    );

    // Assert
    const form = container.querySelector("form");
    expect(form).toHaveClass("custom-form-class");
  });

  it("should pass through form HTML attributes", () => {
    // Arrange & Act
    const { container } = render(
      <Form action="/submit" method="post" noValidate>
        <input type="text" />
      </Form>
    );

    // Assert
    const form = container.querySelector("form");
    expect(form).toHaveAttribute("action", "/submit");
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("noValidate");
  });
});

