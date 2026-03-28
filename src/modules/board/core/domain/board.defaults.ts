import type {
  Column,
  CreateColumnInput,
} from "@/modules/board/core/domain/schema/board.schema";

/**
 * Returns default board configuration (Todo, In Progress, Done).
 * Used when no board configuration exists for a project.
 * Note: boardId will be set in usecase after board creation/retrieval.
 *
 * @param projectId - Project ID (not used currently but kept for future use)
 * @returns Default column configuration inputs
 */
export const getDefaultBoardConfiguration = (
  _projectId: string
): {
  columns: CreateColumnInput[];
} => {
  return {
    columns: [
      {
        boardId: "",
        name: "Todo",
        key: "todo",
        state: "todo",
        position: 0,
        visible: true,
      },
      {
        boardId: "",
        name: "In Progress",
        key: "in-progress",
        state: "in_progress",
        position: 1,
        visible: true,
      },
      {
        boardId: "",
        name: "Done",
        key: "completed",
        state: "done",
        position: 2,
        visible: true,
      },
    ],
  };
};

/**
 * Picks a non-colliding column position for this board (DB: unique board_id + position).
 */
const allocateDistinctPosition = (
  occupiedPositions: Set<number>,
  preferred: number
): number => {
  let position = preferred;
  while (occupiedPositions.has(position)) {
    position += 1;
  }
  occupiedPositions.add(position);
  return position;
};

/**
 * Builds create inputs for default workflow columns (todo, in_progress, done) that are
 * missing from the board. Each workflow state is satisfied by at least one existing
 * column; no extra row is added for a state that already exists. Positions avoid
 * collisions with existing columns (unique board_id + position).
 *
 * @param existingColumns - Columns already stored for the board
 * @returns Inputs to persist; boardId is empty and must be set by the caller
 */
export const buildMissingDefaultColumnCreates = (
  existingColumns: Column[]
): CreateColumnInput[] => {
  const presentStates = new Set(existingColumns.map((column) => column.state));
  const occupiedPositions = new Set(
    existingColumns.map((column) => column.position)
  );
  const templates = getDefaultBoardConfiguration("").columns;
  const creates: CreateColumnInput[] = [];

  for (const template of templates) {
    if (presentStates.has(template.state)) {
      continue;
    }

    const position = allocateDistinctPosition(
      occupiedPositions,
      template.position
    );

    creates.push({
      ...template,
      boardId: "",
      position,
    });
    presentStates.add(template.state);
  }

  return creates;
};
