import { fireEvent,render, screen } from "@testing-library/react";

import Modal from "@/presentation/components/ui/Modal";

// Mock useTranslation
jest.mock("@/shared/i18n", () => ({
  useTranslation: () => (key: string) => {
    const translations: Record<string, string> = {
      dismiss: "Fermer",
      dismissAriaLabel: "Fermer le message d'erreur",
    };
    return translations[key] || key;
  },
}));

describe("Modal Component", () => {
  beforeEach(() => {
    // Create portal root
    const portalRoot = document.createElement("div");
    portalRoot.setAttribute("id", "__next");
    document.body.appendChild(portalRoot);
  });

  afterEach(() => {
    const portalRoot = document.getElementById("__next");
    if (portalRoot) {
      document.body.removeChild(portalRoot);
    }
  });

  it("should not render when isOpen is false", () => {
    // Arrange & Act
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    // Assert
    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    // Arrange & Act
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    // Assert
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should render title", () => {
    // Arrange & Act
    render(
      <Modal isOpen={true} onClose={() => {}} title="Modal Title">
        <p>Content</p>
      </Modal>
    );

    // Assert
    expect(screen.getByText("Modal Title")).toBeInTheDocument();
  });

  it("should render footer when provided", () => {
    // Arrange & Act
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Modal Title"
        footer={<button>Footer Button</button>}
      >
        <p>Content</p>
      </Modal>
    );

    // Assert
    expect(screen.getByText("Footer Button")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    // Arrange
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    // Act
    const closeButton = screen.getByText("Fermer");
    fireEvent.click(closeButton);

    // Assert
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when Escape key is pressed", () => {
    // Arrange
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    // Act
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    // Assert
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when backdrop is clicked", () => {
    // Arrange
    const handleClose = jest.fn();
    render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Test Modal"
        closeOnBackdropClick={true}
      >
        <p>Content</p>
      </Modal>
    );

    // Act
    const backdrop = document.querySelector(".modal-backdrop");
    fireEvent.click(backdrop!);

    // Assert
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should not call onClose when backdrop is clicked if closeOnBackdropClick is false", () => {
    // Arrange
    const handleClose = jest.fn();
    render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Test Modal"
        closeOnBackdropClick={false}
      >
        <p>Content</p>
      </Modal>
    );

    // Act
    const backdrop = document.querySelector(".modal-backdrop");
    fireEvent.click(backdrop!);

    // Assert
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("should have role dialog", () => {
    // Arrange & Act
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    // Assert
    const modal = document.querySelector('[role="dialog"]');
    expect(modal).toBeInTheDocument();
  });

  it("should have aria-modal", () => {
    // Arrange & Act
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    // Assert
    const modal = document.querySelector('[role="dialog"]');
    expect(modal).toHaveAttribute("aria-modal", "true");
  });

  it("should apply size class", () => {
    // Arrange & Act
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal" size="large">
        <p>Content</p>
      </Modal>
    );

    // Assert
    const modal = document.querySelector(".modal");
    expect(modal).toHaveClass("modal--large");
  });
});
