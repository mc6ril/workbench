import styles from "@/domains/project-management/presentation/components/ticket/createTicketForm/CreateTicketForm.module.scss";
import Button from "@/shared/design-system/Button";

type CreateTicketFormActionsProps = {
  submitLabel: string;
  submitAriaLabel: string;
  cancelLabel: string;
  cancelAriaLabel: string;
  canSubmit: boolean;
  isSubmitting?: boolean;
  onCancel?: () => void;
};

const CreateTicketFormActions = ({
  submitLabel,
  submitAriaLabel,
  cancelLabel,
  cancelAriaLabel,
  canSubmit,
  isSubmitting = false,
  onCancel,
}: CreateTicketFormActionsProps) => {
  return (
    <div className={styles["create-ticket-form__actions"]}>
      <Button
        label={submitLabel}
        type="submit"
        disabled={isSubmitting || !canSubmit}
        aria-label={submitAriaLabel}
      />
      {onCancel && (
        <Button
          label={cancelLabel}
          onClick={onCancel}
          variant="secondary"
          disabled={isSubmitting}
          aria-label={cancelAriaLabel}
        />
      )}
    </div>
  );
};

export default CreateTicketFormActions;
