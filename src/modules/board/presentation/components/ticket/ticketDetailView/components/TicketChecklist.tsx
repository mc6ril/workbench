"use client";

import { useRef, useState } from "react";

import SectionTitle from "@/shared/design-system/section_title";
import { useTranslations } from "@/shared/i18n";

import styles from "./TicketChecklist.module.scss";

import type { ChecklistItem } from "@/modules/board/core/domain/ticket.types";
import { useUpdateTicket } from "@/modules/board/presentation/hooks/ticket";

type Props = {
  ticketId: string;
  checklist: ChecklistItem[];
  canEdit: boolean;
};

const TicketChecklist = ({ ticketId, checklist, canEdit }: Props) => {
  const t = useTranslations("pages.ticketDetail.page");
  const updateTicket = useUpdateTicket();
  const [addText, setAddText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  const sorted = [...checklist].sort((a, b) => a.position - b.position);
  const checkedCount = checklist.filter((i) => i.checked).length;
  const totalCount = checklist.length;

  const mutate = (nextChecklist: ChecklistItem[]) => {
    updateTicket.mutate({ id: ticketId, input: { checklist: nextChecklist } });
  };

  const handleToggle = (id: string) => {
    if (!canEdit) return;
    mutate(
      checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAdd = () => {
    const text = addText.trim();
    if (!text || !canEdit) return;
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text,
      checked: false,
      position: checklist.length,
    };
    mutate([...checklist, newItem]);
    setAddText("");
    addInputRef.current?.focus();
  };

  const handleDelete = (id: string) => {
    if (!canEdit) return;
    mutate(
      checklist
        .filter((item) => item.id !== id)
        .map((item, idx) => ({ ...item, position: idx }))
    );
  };

  const handleStartEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEdit = (id: string) => {
    const text = editingText.trim();
    if (!text) {
      setEditingId(null);
      return;
    }
    mutate(
      checklist.map((item) => (item.id === id ? { ...item, text } : item))
    );
    setEditingId(null);
  };

  const progressPercent =
    totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className={styles["checklist"]}>
      <div className={styles["checklist__header"]}>
        <SectionTitle>{t("sections.checklist")}</SectionTitle>
        {totalCount > 0 ? (
          <span className={styles["checklist__progress-label"]}>
            {t("checklist.progress", {
              checked: checkedCount,
              total: totalCount,
            })}
          </span>
        ) : null}
      </div>

      {totalCount > 0 ? (
        <div
          className={styles["checklist__bar-track"]}
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={styles["checklist__bar-fill"]}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      ) : null}

      <ul className={styles["checklist__list"]}>
        {sorted.map((item) => (
          <li key={item.id} className={styles["checklist__item"]}>
            <input
              type="checkbox"
              className={styles["checklist__checkbox"]}
              checked={item.checked}
              disabled={!canEdit}
              aria-label={item.text}
              onChange={() => handleToggle(item.id)}
            />

            {editingId === item.id ? (
              <input
                autoFocus
                className={styles["checklist__edit-input"]}
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => handleSaveEdit(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit(item.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
              />
            ) : (
              <span
                className={[
                  styles["checklist__item-text"],
                  item.checked ? styles["checklist__item-text--checked"] : null,
                  canEdit ? styles["checklist__item-text--editable"] : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => canEdit && handleStartEdit(item)}
              >
                {item.text}
              </span>
            )}

            {canEdit ? (
              <button
                type="button"
                className={styles["checklist__delete-btn"]}
                aria-label={t("checklist.deleteItem")}
                onClick={() => handleDelete(item.id)}
              >
                ×
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {canEdit ? (
        <div className={styles["checklist__add-row"]}>
          <input
            ref={addInputRef}
            type="text"
            className={styles["checklist__add-input"]}
            placeholder={t("checklist.addPlaceholder")}
            value={addText}
            onChange={(e) => setAddText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default TicketChecklist;
