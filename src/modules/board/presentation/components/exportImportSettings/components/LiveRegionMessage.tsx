import Text from "@/shared/design-system/Text";

import styles from "@/modules/board/presentation/components/exportImportSettings/ExportImportSettings.module.scss";

type LiveRegionMessageProps = {
  id: string;
  message?: string;
  isError?: boolean;
};

const LiveRegionMessage = ({
  id,
  message,
  isError = false,
}: LiveRegionMessageProps) => {
  return (
    <div
      id={id}
      className={styles["export-import-settings__live-region"]}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message && (
        <Text
          as="p"
          variant="body"
          className={
            isError
              ? styles["export-import-settings__message-error"]
              : styles["export-import-settings__message"]
          }
        >
          {message}
        </Text>
      )}
    </div>
  );
};

export default LiveRegionMessage;
