"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./Tooltip.module.scss";

type TooltipPlacement = "top" | "bottom" | "left" | "right" | "auto";

type Props = {
  /** Tooltip trigger element */
  children: React.ReactElement;
  /** Tooltip content */
  content: string;
  /** Tooltip placement */
  placement?: TooltipPlacement;
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
};

/**
 * Reusable Tooltip component for displaying contextual help and additional information.
 * Shows on hover (mouse) and focus (keyboard) with configurable placement.
 * Includes full accessibility support with proper ARIA attributes.
 *
 * @example
 * ```tsx
 * <Tooltip content="Click to save" placement="top">
 *   <Button label="Save" onClick={handleSave} />
 * </Tooltip>
 * ```
 *
 * @example
 * ```tsx
 * <Tooltip content="Additional information" delay={300}>
 *   <span>Hover me</span>
 * </Tooltip>
 * ```
 */
const Tooltip = ({
  children,
  content,
  placement = "top",
  delay = 0,
  ariaLabel: _ariaLabel,
}: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipId = getAccessibilityId("tooltip");

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let top = 0;
    let left = 0;
    let finalPlacement = placement;

    // Auto placement: adjust if tooltip would go out of viewport
    if (placement === "auto") {
      const spaceTop = triggerRect.top;
      const spaceBottom = window.innerHeight - triggerRect.bottom;
      const _spaceLeft = triggerRect.left;
      const spaceRight = window.innerWidth - triggerRect.right;

      finalPlacement =
        spaceBottom >= tooltipRect.height
          ? "bottom"
          : spaceTop >= tooltipRect.height
            ? "top"
            : spaceRight >= tooltipRect.width
              ? "right"
              : "left";
    }

    switch (finalPlacement) {
      case "top":
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left =
          triggerRect.left +
          scrollX +
          triggerRect.width / 2 -
          tooltipRect.width / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + scrollY + 8;
        left =
          triggerRect.left +
          scrollX +
          triggerRect.width / 2 -
          tooltipRect.width / 2;
        break;
      case "left":
        top =
          triggerRect.top +
          scrollY +
          triggerRect.height / 2 -
          tooltipRect.height / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case "right":
        top =
          triggerRect.top +
          scrollY +
          triggerRect.height / 2 -
          tooltipRect.height / 2;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    top = Math.max(
      padding,
      Math.min(top, window.innerHeight + scrollY - tooltipRect.height - padding)
    );
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth + scrollX - tooltipRect.width - padding)
    );

    setTooltipPosition({ top, left });
  }, [placement]);

  const showTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      calculatePosition();
    }
  }, [isVisible, calculatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const childElement = children as React.ReactElement<{
    onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
    "aria-describedby"?: string;
  }>;

  // Extract original props before cloneElement to avoid ESLint immutability error
  const originalRef =
    (childElement as { ref?: React.Ref<HTMLElement> }).ref || null;
  const originalOnMouseEnter = childElement.props.onMouseEnter;
  const originalOnMouseLeave = childElement.props.onMouseLeave;
  const originalOnFocus = childElement.props.onFocus;
  const originalOnBlur = childElement.props.onBlur;

  // Use useCallback to memoize the ref callback to satisfy ESLint
  const handleRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
      // Forward ref to original element if it exists
      if (originalRef) {
        if (typeof originalRef === "function") {
          originalRef(node);
        } else if (typeof originalRef === "object" && originalRef !== null) {
          // This is necessary to forward refs in React.cloneElement patterns
          // We need to modify the ref.current, which is the expected behavior for refs
          const refObject =
            originalRef as React.MutableRefObject<HTMLElement | null>;
          // eslint-disable-next-line react-hooks/immutability -- ref forwarding pattern
          refObject.current = node;
        }
      }
    },
    [originalRef]
  );

  const triggerElement = React.cloneElement(childElement, {
    ref: handleRef,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      showTooltip();
      originalOnMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      hideTooltip();
      originalOnMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      showTooltip();
      originalOnFocus?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      hideTooltip();
      originalOnBlur?.(e);
    },
    "aria-describedby": isVisible ? tooltipId : undefined,
  } as Partial<typeof childElement.props>);

  const tooltipContent = isVisible
    ? createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          className={styles.tooltip}
          role="tooltip"
          aria-hidden="false"
          style={{
            position: "absolute",
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {content}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {triggerElement}
      {tooltipContent}
    </>
  );
};

export default React.memo(Tooltip);
