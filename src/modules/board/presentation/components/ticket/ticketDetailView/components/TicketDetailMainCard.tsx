import type { ReactNode } from "react";

import { getAccessibilityId } from "@/shared/a11y";
import Card from "@/shared/design-system/Card";
import Textarea from "@/shared/design-system/Textarea";
import { useTranslation } from "@/shared/i18n";

import styles from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";

type Props = {
  title: string;
  description: string;
  canEditTicket: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  commentsSection: ReactNode;
};

const TicketDetailMainCard = ({
  title,
  description,
  canEditTicket,
  onTitleChange,
  onDescriptionChange,
  commentsSection,
}: Props) => {
  const t = useTranslation("pages.ticketDetail.page");
  const titleInputId = getAccessibilityId("ticket-title");

  return (
    <Card className={styles["ticket-detail__main"]}>
      <div className={styles["ticket-detail__field"]}>
        <label htmlFor={titleInputId}>{t("fields.title")}</label>
        <input
          id={titleInputId}
          className={styles["ticket-detail__input"]}
          value={title}
          disabled={!canEditTicket}
          onChange={(event) => {
            onTitleChange(event.target.value);
          }}
        />
      </div>

      <div className={styles["ticket-detail__field"]}>
        <Textarea
          label={t("fields.description")}
          value={description}
          rows={6}
          disabled={!canEditTicket}
          onChange={(event) => {
            onDescriptionChange(event.target.value);
          }}
        />
      </div>

      {commentsSection}
    </Card>
  );
};

export default TicketDetailMainCard;
