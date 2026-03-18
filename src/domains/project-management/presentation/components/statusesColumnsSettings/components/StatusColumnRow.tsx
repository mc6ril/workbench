import styles from "@/domains/project-management/presentation/components/statusesColumnsSettings/StatusesColumnsSettings.module.scss";
import type {
  MoveDirection,
  StatusColumnItem,
} from "@/domains/project-management/presentation/components/statusesColumnsSettings/StatusesColumnsSettings.types";
import Button from "@/shared/design-system/Button";
import Checkbox from "@/shared/design-system/Checkbox";
import Input from "@/shared/design-system/Input";

import { getAccessibilityId } from "@/shared/a11y/constants";

type StatusColumnRowProps = {
  column: StatusColumnItem;
  index: number;
  total: number;
  isSaving: boolean;
  enabledLabel: string;
  enabledAriaLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  nameAriaLabel: string;
  moveUpLabel: string;
  moveUpAriaLabel: string;
  moveDownLabel: string;
  moveDownAriaLabel: string;
  onToggleEnabled: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onMove: (id: string, direction: MoveDirection) => void;
};

const StatusColumnRow = ({
  column,
  index,
  total,
  isSaving,
  enabledLabel,
  enabledAriaLabel,
  nameLabel,
  namePlaceholder,
  nameAriaLabel,
  moveUpLabel,
  moveUpAriaLabel,
  moveDownLabel,
  moveDownAriaLabel,
  onToggleEnabled,
  onRename,
  onMove,
}: StatusColumnRowProps) => {
  const itemId = getAccessibilityId(`settings-status-column-${column.id}`);
  const canMoveUp = index > 0;
  const canMoveDown = index < total - 1;

  return (
    <li className={styles["statuses-columns-settings__item"]}>
      <div className={styles["statuses-columns-settings__item-main"]}>
        <Checkbox
          id={`${itemId}-enabled`}
          label={enabledLabel}
          checked={column.isEnabled}
          onChange={() => onToggleEnabled(column.id)}
          disabled={isSaving}
          aria-label={enabledAriaLabel}
        />
        <Input
          id={`${itemId}-name`}
          label={nameLabel}
          value={column.name}
          placeholder={namePlaceholder}
          onChange={(event) => onRename(column.id, event.target.value)}
          disabled={isSaving}
          aria-label={nameAriaLabel}
        />
      </div>

      <div className={styles["statuses-columns-settings__item-actions"]}>
        <Button
          label={moveUpLabel}
          onClick={() => onMove(column.id, "up")}
          variant="ghost"
          disabled={!canMoveUp || isSaving}
          aria-label={moveUpAriaLabel}
        />
        <Button
          label={moveDownLabel}
          onClick={() => onMove(column.id, "down")}
          variant="ghost"
          disabled={!canMoveDown || isSaving}
          aria-label={moveDownAriaLabel}
        />
      </div>
    </li>
  );
};

export default StatusColumnRow;
