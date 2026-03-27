import { type ChangeEvent } from "react";

import Input from "@/shared/design-system/input";
import Select from "@/shared/design-system/select";
import Textarea from "@/shared/design-system/textarea";

import styles from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.module.scss";
import type { Option } from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.types";
import { extractSelectedOptionValues } from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.utils";

type CreateTicketFormFieldsProps = {
  title: string;
  description: string;
  status: string;
  labelIds: string[];
  statusOptions: Option[];
  labelOptions: Option[];
  isSubmitting?: boolean;
  titleLabel: string;
  statusLabel: string;
  labelsLabel: string;
  descriptionLabel: string;
  onTitleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onLabelIdsChange: (next: string[]) => void;
  onDescriptionChange: (value: string) => void;
};

const CreateTicketFormFields = ({
  title,
  description,
  status,
  labelIds,
  statusOptions,
  labelOptions,
  isSubmitting = false,
  titleLabel,
  statusLabel,
  labelsLabel,
  descriptionLabel,
  onTitleChange,
  onStatusChange,
  onLabelIdsChange,
  onDescriptionChange,
}: CreateTicketFormFieldsProps) => {
  const handleLabelsChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    onLabelIdsChange(extractSelectedOptionValues(event.target.selectedOptions));
  };

  return (
    <div className={styles["create-ticket-form__fields"]}>
      <div className={styles["create-ticket-form__field"]}>
        <Input
          label={titleLabel}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          required
        />
      </div>
      <div
        className={`${styles["create-ticket-form__field"]} ${styles["create-ticket-form__field--half"]}`}
        >
        <Select
          label={statusLabel}
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          options={statusOptions}
        />
      </div>
      <div
        className={`${styles["create-ticket-form__field"]} ${styles["create-ticket-form__field--half"]}`}
      >
        <Select
          label={labelsLabel}
          value={labelIds}
          onChange={handleLabelsChange}
          options={labelOptions}
          multiple
          size={Math.min(4, Math.max(1, labelOptions.length))}
          disabled={isSubmitting}
        />
      </div>
      <div className={styles["create-ticket-form__field"]}>
        <Textarea
          label={descriptionLabel}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </div>
    </div>
  );
};

export default CreateTicketFormFields;
