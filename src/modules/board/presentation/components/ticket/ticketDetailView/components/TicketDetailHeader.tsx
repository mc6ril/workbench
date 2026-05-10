import { useLayoutEffect, useRef } from "react";

import Text from "@/shared/design-system/text";
import { useTranslations } from "@/shared/i18n";

import styles from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";

type Props = {
  title: string;
  ticketCode: string;
  canEditTicket: boolean;
  onTitleChange: (value: string) => void;
};

const TicketDetailHeader = ({
  title,
  ticketCode,
  canEditTicket,
  onTitleChange,
}: Props) => {
  const t = useTranslations("pages.ticketDetail.page");
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
        <Text
          as="span"
          variant="caption"
          className={styles["ticket-detail__code"]}
        >
          {ticketCode}
        </Text>
      </div>
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
    </header>
  );
};

export default TicketDetailHeader;
