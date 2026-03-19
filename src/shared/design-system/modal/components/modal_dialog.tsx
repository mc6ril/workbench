import type { ReactNode, RefObject } from "react";

import styles from "@/shared/design-system/modal/modal.module.scss";
import type { ModalSize } from "@/shared/design-system/modal/modal.types";

type Props = {
  modalRef: RefObject<HTMLDivElement | null>;
  modalId: string;
  size: ModalSize;
  titleId: string;
  title: string;
  descriptionId: string;
  ariaDescribedBy?: string;
  ariaLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  dismissAriaLabel: string;
  dismissLabel: string;
  onCloseButtonClick: () => void;
};

const ModalDialog = ({
  modalRef,
  modalId,
  size,
  titleId,
  title,
  descriptionId,
  ariaDescribedBy,
  ariaLabel,
  children,
  footer,
  dismissAriaLabel,
  dismissLabel,
  onCloseButtonClick,
}: Props) => {
  const modalClassName = `${styles.modal} ${styles[`modal--${size}`]}`;

  return (
    <div
      ref={modalRef}
      id={modalId}
      className={modalClassName}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={ariaDescribedBy ? descriptionId : undefined}
      aria-label={ariaLabel}
      onClick={(event) => event.stopPropagation()}
    >
      <div className={styles["modal__header"]}>
        <h2 id={titleId} className={styles["modal__title"]}>
          {title}
        </h2>
        <button
          type="button"
          onClick={onCloseButtonClick}
          className={styles["modal__close-button"]}
          aria-label={dismissAriaLabel}
        >
          {dismissLabel}
        </button>
      </div>

      <div id={descriptionId} className={styles["modal__body"]}>
        {children}
      </div>

      {footer && <div className={styles["modal__footer"]}>{footer}</div>}
    </div>
  );
};

export default ModalDialog;
