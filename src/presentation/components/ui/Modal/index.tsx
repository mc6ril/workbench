"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Button, Title } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./Modal.module.scss";

type ModalSize = "small" | "medium" | "large" | "full";

type Props = {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal content */
  children: React.ReactNode;
  /** Optional modal footer */
  footer?: React.ReactNode;
  /** Modal size variant */
  size?: ModalSize;
  /** Whether to close on backdrop click */
  closeOnBackdropClick?: boolean;
  /** Custom ARIA label */
  ariaLabel?: string;
  /** Custom ARIA description ID */
  ariaDescribedBy?: string;
};

/**
 * Reusable Modal component with focus management and accessibility.
 * Includes focus trapping, body scroll lock, keyboard navigation, and proper ARIA attributes.
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Delete Item"
 * >
 *   <p>Are you sure you want to delete this item?</p>
 * </Modal>
 * ```
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "medium",
  closeOnBackdropClick = true,
  ariaLabel,
  ariaDescribedBy,
}: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const t = useTranslation("common");

  const modalId = getAccessibilityId("modal");
  const titleId = getAccessibilityId("modal-title");
  const descriptionId =
    ariaDescribedBy || getAccessibilityId("modal-description");

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    } else {
      previousActiveElementRef.current?.focus();
    }
  }, [isOpen]);

  // Focus trapping
  const handleTabKey = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || !modalRef.current) {
        return;
      }

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    },
    [isOpen]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleTabKey);
      return () => {
        document.removeEventListener("keydown", handleTabKey);
      };
    }
  }, [isOpen, handleTabKey]);

  // Escape key handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // Hide background content from screen readers
  useEffect(() => {
    if (isOpen) {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        mainContent.setAttribute("aria-hidden", "true");
      }
      return () => {
        if (mainContent) {
          mainContent.removeAttribute("aria-hidden");
        }
      };
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  const handleCloseButtonClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  const modalContent = createPortal(
    <div
      className={styles["modal-backdrop"]}
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        id={modalId}
        className={`${styles.modal} ${styles[`modal--${size}`]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={ariaDescribedBy ? descriptionId : undefined}
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles["modal__header"]}>
          <Title id={titleId} variant="h2" className={styles["modal__title"]}>
            {title}
          </Title>
          <Button
            label={t("dismiss")}
            onClick={handleCloseButtonClick}
            variant="secondary"
            aria-label={t("dismissAriaLabel")}
            type="button"
          />
        </div>
        <div id={descriptionId} className={styles["modal__body"]}>
          {children}
        </div>
        {footer && <div className={styles["modal__footer"]}>{footer}</div>}
      </div>
    </div>,
    document.body
  );

  return modalContent;
};

export default React.memo(Modal);
