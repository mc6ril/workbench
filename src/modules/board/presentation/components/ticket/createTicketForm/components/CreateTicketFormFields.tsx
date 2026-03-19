import { type ChangeEvent, useMemo } from "react";

import Input from "@/shared/design-system/Input";
import Select from "@/shared/design-system/Select";
import Textarea from "@/shared/design-system/Textarea";

import styles from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.module.scss";
import type { Option } from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.types";
import {
  buildEpicOptions,
  extractSelectedOptionValues,
} from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.utils";

type CreateTicketFormFieldsProps = {
  title: string;
  description: string;
  status: string;
  epicId: string;
  labelIds: string[];
  statusOptions: Option[];
  epicOptions: Option[];
  labelOptions: Option[];
  showEpicField: boolean;
  isSubmitting?: boolean;
  titleLabel: string;
  statusLabel: string;
  epicLabel: string;
  labelsLabel: string;
  descriptionLabel: string;
  onTitleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onEpicChange: (value: string) => void;
  onLabelIdsChange: (next: string[]) => void;
  onDescriptionChange: (value: string) => void;
};

const CreateTicketFormFields = ({
  title,
  description,
  status,
  epicId,
  labelIds,
  statusOptions,
  epicOptions,
  labelOptions,
  showEpicField,
  isSubmitting = false,
  titleLabel,
  statusLabel,
  epicLabel,
  labelsLabel,
  descriptionLabel,
  onTitleChange,
  onStatusChange,
  onEpicChange,
  onLabelIdsChange,
  onDescriptionChange,
}: CreateTicketFormFieldsProps) => {
  const epicSelectOptions = useMemo(() => buildEpicOptions(epicOptions), [epicOptions]);

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
      {showEpicField && (
        <div
          className={`${styles["create-ticket-form__field"]} ${styles["create-ticket-form__field--half"]}`}
        >
          <Select
            label={epicLabel}
            value={epicId}
            onChange={(event) => onEpicChange(event.target.value)}
            options={epicSelectOptions}
          />
        </div>
      )}
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
