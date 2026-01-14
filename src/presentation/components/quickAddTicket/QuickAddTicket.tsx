import React, { useCallback,useState } from "react";

import { Button, ErrorMessage,Input } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./QuickAddTicket.module.scss";

type Props = {
  onSubmit: (title: string) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
};

const QuickAddTicket = ({
  onSubmit,
  isLoading = false,
  error = null,
  className,
}: Props) => {
  const t = useTranslation("pages.home.quickAddTicket");
  const [title, setTitle] = useState("");
  const formId = getAccessibilityId("quick-add-ticket-form");

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      if (!title.trim() || isLoading) {
        return;
      }
      await onSubmit(title.trim());
      setTitle("");
    },
    [title, isLoading, onSubmit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setTitle(e.target.value);
    },
    []
  );

  const formClasses = [styles["quick-add-ticket"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <form
      id={formId}
      className={formClasses}
      onSubmit={handleSubmit}
      aria-label={t("title")}
    >
      <div className={styles["quick-add-ticket__field"]}>
        <Input
          label={t("title")}
          type="text"
          value={title}
          onChange={handleChange}
          placeholder={t("placeholder")}
          disabled={isLoading}
          required
          aria-label={t("title")}
        />
      </div>
      <div className={styles["quick-add-ticket__actions"]}>
        <Button
          label={t("submitButton")}
          type="submit"
          disabled={isLoading || !title.trim()}
          aria-label={t("submitButtonAriaLabel")}
        />
      </div>
      {error && (
        <div className={styles["quick-add-ticket__error"]}>
          <ErrorMessage message={error} />
        </div>
      )}
    </form>
  );
};

export default QuickAddTicket;