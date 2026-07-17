import type { Column } from "@/modules/board/core/domain/board.types";

export type WorkflowColumn = Pick<Column, "id" | "state">;

type ResolveCompletedAtInput = {
  previousColumnId?: string | null;
  previousCompletedAt?: Date | null;
  nextColumnId: string;
  columns: WorkflowColumn[];
  now?: Date;
};

export const getDoneWorkflowColumnIds = (
  columns: WorkflowColumn[]
): Set<string> => {
  return new Set(
    columns
      .filter((column) => column.state === "done")
      .map((column) => column.id)
  );
};

export const resolveCompletedAtForColumnChange = ({
  previousColumnId,
  previousCompletedAt = null,
  nextColumnId,
  columns,
  now = new Date(),
}: ResolveCompletedAtInput): Date | null => {
  const doneColumnIds = getDoneWorkflowColumnIds(columns);
  const wasDone =
    typeof previousColumnId === "string" && doneColumnIds.has(previousColumnId);
  const willBeDone = doneColumnIds.has(nextColumnId);

  if (!wasDone && willBeDone) {
    return now;
  }

  if (wasDone && !willBeDone) {
    return null;
  }

  return previousCompletedAt;
};
