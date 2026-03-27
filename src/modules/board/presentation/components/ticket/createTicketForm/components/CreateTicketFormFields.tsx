import Input from "@/shared/design-system/input";
import Select from "@/shared/design-system/select";
import Textarea from "@/shared/design-system/textarea";

import styles from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.module.scss";
import type { Option } from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.types";

type CreateTicketFormFieldsProps = {
  title: string;
  description: string;
  status: string;
  statusOptions: Option[];
  titleLabel: string;
  statusLabel: string;
  descriptionLabel: string;
  onTitleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

const CreateTicketFormFields = ({
  title,
  description,
  status,
  statusOptions,
  titleLabel,
  statusLabel,
  descriptionLabel,
  onTitleChange,
  onStatusChange,
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
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          options={statusOptions}
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
