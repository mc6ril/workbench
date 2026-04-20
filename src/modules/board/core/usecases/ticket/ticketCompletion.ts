import type { Column } from "@/modules/board/core/domain/board.types";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";
import { getBoardConfiguration } from "@/modules/board/core/usecases/board/getBoardConfiguration";

type WorkflowColumn = Pick<Column, "id" | "state">;

type ResolveCompletedAtInput = {
  previousColumnId?: string | null;
  previousCompletedAt?: Date | null;
  nextColumnId: string;
  columns: WorkflowColumn[];
  now?: Date;
};

type ResolveCompletedAtByProjectInput = Omit<
  ResolveCompletedAtInput,
  "columns"
>;

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

export const resolveCompletedAtForProjectColumnChange = async (
  boardRepository: BoardRepository,
  projectId: string,
  input: ResolveCompletedAtByProjectInput
): Promise<Date | null> => {
  const boardConfiguration = await getBoardConfiguration(
    boardRepository,
    projectId
  );

  return resolveCompletedAtForColumnChange({
    ...input,
    columns: boardConfiguration.columns,
  });
};
