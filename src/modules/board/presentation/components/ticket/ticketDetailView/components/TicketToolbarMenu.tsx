"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { MoreHorizontalIcon, TrashIcon } from "@/shared/design-system/icons";
import { useTranslations } from "@/shared/i18n";

import styles from "./TicketToolbarMenu.module.scss";

type Props = {
  onDeleteClick: () => void;
};

const TicketToolbarMenu = ({ onDeleteClick }: Props) => {
  const t = useTranslations("pages.ticketDetail.page");
  const tCommon = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={styles["ticket-toolbar-menu"]}>
      <button
        type="button"
        className={styles["ticket-toolbar-menu__trigger"]}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t("actions.moreActions")}
        title={t("actions.moreActions")}
      >
        <MoreHorizontalIcon size={18} />
      </button>

      {isOpen ? (
        <div role="menu" className={styles["ticket-toolbar-menu__panel"]}>
          <button
            type="button"
            role="menuitem"
            className={[
              styles["ticket-toolbar-menu__item"],
              styles["ticket-toolbar-menu__item--danger"],
            ].join(" ")}
            onClick={() => {
              close();
              onDeleteClick();
            }}
          >
            <TrashIcon size={14} />
            {tCommon("delete")}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default React.memo(TicketToolbarMenu);
