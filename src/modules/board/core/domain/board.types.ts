export const COLUMN_WORKFLOW_STATE_VALUES = ["todo", "in_progress", "done"] as const;

/**
 * Canonical workflow state for board columns.
 * This state is stable and drives business logic (progress metrics).
 */
export type ColumnWorkflowState = (typeof COLUMN_WORKFLOW_STATE_VALUES)[number];

export type Board = {
  id: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBoardInput = {
  projectId: string;
};

export type Column = {
  id: string;
  boardId: string;
  name: string;
  key: string;
  state: ColumnWorkflowState;
  position: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateColumnInput = {
  boardId: string;
  name: string;
  key: string;
  state: ColumnWorkflowState;
  position?: number;
  visible?: boolean;
};

export type UpdateColumnInput = {
  name?: string;
  key?: string;
  state?: ColumnWorkflowState;
  position?: number;
  visible?: boolean;
};

/**
 * Board configuration with columns.
 * Used when retrieving board configuration.
 */
export type BoardConfiguration = {
  board: Board;
  columns: Column[];
};

export type ConfigureColumnsInput = {
  projectId: string;
  columns: Array<{
    id?: string;
    name: string;
    key?: string;
    state: ColumnWorkflowState;
    position: number;
    visible: boolean;
  }>;
};

