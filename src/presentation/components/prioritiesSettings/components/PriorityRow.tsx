import styles from "@/presentation/components/prioritiesSettings/PrioritiesSettings.module.scss";
import type {
  MoveDirection,
  PriorityItem,
} from "@/presentation/components/prioritiesSettings/PrioritiesSettings.types";
import Button from "@/shared/design-system/Button";
import Input from "@/shared/design-system/Input";

import { getAccessibilityId } from "@/shared/a11y/constants";

type PriorityRowProps = {
  priority: PriorityItem;
  index: number;
  total: number;
  isSaving: boolean;
  nameLabel: string;
  namePlaceholder: string;
  nameAriaLabel: string;
  moveUpLabel: string;
  moveDownLabel: string;
  moveUpAriaLabel: string;
  moveDownAriaLabel: string;
  onRename: (id: string, name: string) => void;
  onMove: (id: string, direction: MoveDirection) => void;
};

const PriorityRow = ({
  priority,
  index,
  total,
  isSaving,
  nameLabel,
  namePlaceholder,
  nameAriaLabel,
  moveUpLabel,
  moveDownLabel,
  moveUpAriaLabel,
  moveDownAriaLabel,
  onRename,
  onMove,
}: PriorityRowProps) => {
  const itemId = getAccessibilityId(`settings-priority-${priority.id}`);
  const canMoveUp = index > 0;
  const canMoveDown = index < total - 1;

  return (
    <li className={styles["priorities-settings__item"]}>
      <div className={styles["priorities-settings__item-main"]}>
        <Input
          id={`${itemId}-name`}
          label={nameLabel}
          value={priority.name}
          placeholder={namePlaceholder}
          onChange={(event) => onRename(priority.id, event.target.value)}
          disabled={isSaving}
          aria-label={nameAriaLabel}
        />
      </div>
      <div className={styles["priorities-settings__item-actions"]}>
        <Button
          label={moveUpLabel}
          onClick={() => onMove(priority.id, "up")}
          variant="ghost"
          disabled={!canMoveUp || isSaving}
          aria-label={moveUpAriaLabel}
        />
        <Button
          label={moveDownLabel}
          onClick={() => onMove(priority.id, "down")}
          variant="ghost"
          disabled={!canMoveDown || isSaving}
          aria-label={moveDownAriaLabel}
        />
      </div>
    </li>
  );
};

export default PriorityRow;
