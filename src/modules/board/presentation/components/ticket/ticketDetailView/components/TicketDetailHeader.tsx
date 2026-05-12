import { useLayoutEffect, useRef } from "react";

import Text from "@/shared/design-system/text";
import { useTranslations } from "@/shared/i18n";

import styles from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";

type Props = {
  title: string;
  ticketCode: string;
  canEditTicket: boolean;
  onTitleChange: (value: string) => void;
  onTitleReset: () => void;
};

const TicketDetailHeader = ({
  title,
  ticketCode,
  canEditTicket,
  onTitleChange,
  onTitleReset,
}: Props) => {
  const t = useTranslations("pages.ticketDetail.page");
  const tBoard = useTranslations("pages.board.newTicket");
  const titleRef = useRef<HTMLTextAreaElement | null>(null);

  const placeholder = tBoard("defaultTitle");

  // When title equals the placeholder text, show an empty input so the
  // HTML placeholder renders — giving a "ghost text" UX for new tickets.
  const displayValue = title === placeholder ? "" : title;

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
        value={displayValue}
        placeholder={placeholder}
        className={styles["ticket-detail__title-input"]}
        aria-label={t("fields.title")}
        disabled={!canEditTicket}
        onFocus={() => {
          // Clear the draft so the user types from scratch rather than
          // having to manually delete the placeholder text.
          if (title === placeholder) {
            onTitleChange("");
          }
        }}
        onBlur={() => {
          // Revert to the server title when the user leaves without typing.
          if (!title.trim()) {
            onTitleReset();
          }
        }}
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
