import type { Column } from "@/modules/board/core/domain/schema/board.schema";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";

import { getBoardConfiguration } from "@/modules/board/core/usecases/board/getBoardConfiguration";

type WorkflowColumn = Pick<Column, "status" | "state">;

type ResolveCompletedAtInput = {
  previousStatus?: string | null;
  previousCompletedAt?: Date | null;
  nextStatus: string;
  columns: WorkflowColumn[];
  now?: Date;
};

type ResolveCompletedAtByProjectInput = Omit<ResolveCompletedAtInput, "columns">;

export const normalizeWorkflowStatus = (status: string): string => {
  return status.trim().toLowerCase();
};

export const getDoneWorkflowStatuses = (
  columns: WorkflowColumn[]
): Set<string> => {
  return new Set(
    columns
      .filter((column) => column.state === "done")
      .map((column) => normalizeWorkflowStatus(column.status))
  );
};

export const resolveCompletedAtForStatusChange = ({
  previousStatus,
  previousCompletedAt = null,
  nextStatus,
  columns,
  now = new Date(),
}: ResolveCompletedAtInput): Date | null => {
  const doneStatuses = getDoneWorkflowStatuses(columns);
  const wasDone =
    typeof previousStatus === "string" &&
    doneStatuses.has(normalizeWorkflowStatus(previousStatus));
  const willBeDone = doneStatuses.has(normalizeWorkflowStatus(nextStatus));

  if (!wasDone && willBeDone) {
    return now;
  }

  if (wasDone && !willBeDone) {
    return null;
  }

  return previousCompletedAt;
};

export const resolveCompletedAtForProjectStatusChange = async (
  boardRepository: BoardRepository,
  projectId: string,
  input: ResolveCompletedAtByProjectInput
): Promise<Date | null> => {
  const boardConfiguration = await getBoardConfiguration(boardRepository, projectId);

  return resolveCompletedAtForStatusChange({
    ...input,
    columns: boardConfiguration.columns,
  });
};
