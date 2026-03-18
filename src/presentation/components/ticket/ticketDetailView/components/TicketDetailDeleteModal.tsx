import styles from "@/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";
import Button from "@/shared/design-system/Button";
import Modal from "@/shared/design-system/Modal";
import Text from "@/shared/design-system/Text";

import { useTranslation } from "@/shared/i18n";

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
  const t = useTranslation("pages.ticketDetail.page");
  const tCommon = useTranslation("common");

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
