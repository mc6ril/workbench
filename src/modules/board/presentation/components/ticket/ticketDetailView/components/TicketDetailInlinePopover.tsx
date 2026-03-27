"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import styles from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";

type TicketDetailInlinePopoverRenderTriggerArgs = {
  isOpen: boolean;
  buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement>;
};

type Props = {
  panelAriaLabel: string;
  disabled?: boolean;
  align?: "start" | "end";
  className?: string;
  panelClassName?: string;
  renderTrigger: (
    args: TicketDetailInlinePopoverRenderTriggerArgs
  ) => React.ReactNode;
  children: (actions: { close: () => void }) => React.ReactNode;
};

const TicketDetailInlinePopover = ({
  panelAriaLabel,
  disabled = false,
  align = "start",
  className,
  panelClassName,
  renderTrigger,
  children,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleToggle = useCallback(() => {
    if (disabled) {
      return;
    }

    setIsOpen((previousValue) => !previousValue);
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!containerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const wrapperClassName = [
    styles["ticket-detail__inline-popover"],
    align === "end" && styles["ticket-detail__inline-popover--end"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const popoverClassName = [
    styles["ticket-detail__popover"],
    panelClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={containerRef} className={wrapperClassName}>
      {renderTrigger({
        isOpen,
        buttonProps: {
          type: "button",
          onClick: handleToggle,
          disabled,
          "aria-expanded": isOpen,
          "aria-haspopup": "dialog",
        },
      })}

      {isOpen ? (
        <div
          role="dialog"
          aria-label={panelAriaLabel}
          className={popoverClassName}
        >
          {children({ close: handleClose })}
        </div>
      ) : null}
    </div>
  );
};

export default React.memo(TicketDetailInlinePopover);
