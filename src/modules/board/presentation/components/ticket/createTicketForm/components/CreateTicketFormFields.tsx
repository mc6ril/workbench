import Input from "@/shared/design-system/input";
import Select from "@/shared/design-system/select";
import Textarea from "@/shared/design-system/textarea";

import styles from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.module.scss";
import type { Option } from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.types";

type CreateTicketFormFieldsProps = {
  title: string;
  description: string;
  columnId: string;
  columnOptions: Option[];
  titleLabel: string;
  statusLabel: string;
  descriptionLabel: string;
  onTitleChange: (value: string) => void;
  onColumnChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

const CreateTicketFormFields = ({
  title,
  description,
  columnId,
  columnOptions,
  titleLabel,
  statusLabel,
  descriptionLabel,
  onTitleChange,
  onColumnChange,
  onDescriptionChange,
}: CreateTicketFormFieldsProps) => {
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
      <div className={styles["create-ticket-form__field"]}>
        <Select
          label={statusLabel}
          value={columnId}
          onChange={(event) => onColumnChange(event.target.value)}
          options={columnOptions}
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
