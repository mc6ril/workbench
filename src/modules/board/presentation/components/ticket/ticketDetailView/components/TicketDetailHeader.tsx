import { useLayoutEffect, useRef } from "react";

import { useTranslation } from "@/shared/i18n";

import styles from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";

type Props = {
  title: string;
  ticketCode: string;
  canEditTicket: boolean;
  onTitleChange: (value: string) => void;
  onClose: () => void;
};

const TicketDetailHeader = ({
  title,
  ticketCode,
  canEditTicket,
  onTitleChange,
  onClose,
}: Props) => {
  const t = useTranslation("pages.ticketDetail.page");
  const tCommon = useTranslation("common");
  const titleRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const element = titleRef.current;
    if (!element) {
      return;
    }

    element.style.height = "0";
    element.style.height = `${element.scrollHeight}px`;
  }, [title]);

  return (
    <header className={styles["ticket-detail__header"]}>
      <div className={styles["ticket-detail__header-copy"]}>
        <span className={styles["ticket-detail__code"]}>{ticketCode}</span>
        <textarea
          ref={titleRef}
          rows={1}
          value={title}
          className={styles["ticket-detail__title-input"]}
          aria-label={t("fields.title")}
          disabled={!canEditTicket}
          onInput={(event) => {
            event.currentTarget.style.height = "0";
            event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
          }}
          onChange={(event) => {
            onTitleChange(event.target.value);
          }}
        />
      </div>

      <button
        type="button"
        className={styles["ticket-detail__close-button"]}
        onClick={onClose}
        aria-label={tCommon("dismiss")}
      >
        ✕
      </button>
    </header>
  );
};

export default TicketDetailHeader;
