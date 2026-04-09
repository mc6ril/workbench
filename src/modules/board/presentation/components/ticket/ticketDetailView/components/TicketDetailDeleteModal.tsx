import Button from "@/shared/design-system/button";
import Modal from "@/shared/design-system/modal";
import Text from "@/shared/design-system/text";
import { useTranslations } from "@/shared/i18n";

import styles from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";

type Props = {
  isOpen: boolean;
  isDeletingTicket: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
};

const TicketDetailDeleteModal = ({
  isOpen,
  isDeletingTicket,
  onClose,
  onConfirmDelete,
}: Props) => {
  const t = useTranslations("pages.ticketDetail.page");
  const tCommon = useTranslations("common");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("actions.deleteModal.title")}
      size="medium"
    >
      <Text variant="small">{t("actions.deleteModal.message")}</Text>
      <div className={styles["ticket-detail__delete-modal-actions"]}>
        <Button
          label={
            isDeletingTicket
              ? t("actions.deleteModal.deleting")
              : t("actions.deleteModal.confirm")
          }
          variant="saveDanger"
          fullWidth
          onClick={onConfirmDelete}
          disabled={isDeletingTicket}
        />
        <Button
          label={tCommon("cancel")}
          variant="secondary"
          fullWidth
          onClick={onClose}
          disabled={isDeletingTicket}
        />
      </div>
    </Modal>
  );
};

export default TicketDetailDeleteModal;
