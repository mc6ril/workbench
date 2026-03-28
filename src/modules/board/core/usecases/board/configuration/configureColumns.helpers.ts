import { createDomainRuleError } from "@/shared/errors/domainRuleError";
import { isString } from "@/shared/utils";

import {
  generateColumnKey,
  normalizeColumnKey,
} from "@/modules/board/core/domain/columnKey.policy";
import { validateBoardWithColumns } from "@/modules/board/core/domain/rules/board.rules";
import type {
  Board,
  Column,
  ConfigureColumnsInput,
} from "@/modules/board/core/domain/schema/board.schema";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";

type ConfigureColumnInputItem = ConfigureColumnsInput["columns"][number];
type ColumnsById = Map<string, Column>;

const TEMP_COLUMN_KEY_PREFIX = "__tmp__column-config__";

const indexColumnsById = (columns: Column[]): ColumnsById => {
  return new Map(columns.map((column) => [column.id, column]));
};

const collectColumnIdsToKeep = (
  columns: ConfigureColumnsInput["columns"]
): Set<string> => {
  return new Set(
    columns
      .map((columnInput) => columnInput.id)
      .filter((columnId): columnId is string => typeof columnId === "string")
  );
};

const findColumnsToDelete = (
  existingColumns: Column[],
  columnIdsToKeep: Set<string>
): Column[] => {
  return existingColumns.filter((column) => !columnIdsToKeep.has(column.id));
};

const findExistingColumn = (
  columnsById: ColumnsById,
  columnId: string | undefined
): Column | undefined => {
  return isString(columnId) ? columnsById.get(columnId) : undefined;
};

const resolveDraftColumnKey = (
  columnInput: ConfigureColumnInputItem,
  existingColumn: Column | undefined,
  occupiedKeys: Set<string>
): string => {
  if (columnInput.key) {
    return columnInput.key;
  }

  if (existingColumn?.key) {
    return existingColumn.key;
  }

  return generateColumnKey(columnInput.name, occupiedKeys, columnInput.state);
};

const createDraftColumn = (
  boardId: string,
  columnInput: ConfigureColumnInputItem,
  existingColumn: Column | undefined,
  index: number,
  occupiedKeys: Set<string>
): Column => {
  const key = resolveDraftColumnKey(columnInput, existingColumn, occupiedKeys);
  occupiedKeys.add(normalizeColumnKey(key));

  return {
    id: existingColumn?.id ?? `draft-column-${index + 1}`,
    boardId,
    name: columnInput.name,
    key,
    state: columnInput.state,
    position: columnInput.position,
    visible: columnInput.visible,
    createdAt: existingColumn?.createdAt ?? new Date(0),
    updatedAt: existingColumn?.updatedAt ?? new Date(0),
  };
};

const buildDraftColumns = (
  boardId: string,
  inputColumns: ConfigureColumnsInput["columns"],
  existingColumnsById: ColumnsById
): Column[] => {
  const occupiedGeneratedKeys = new Set<string>();

  return inputColumns.map((columnInput, index) => {
    const existingColumn = findExistingColumn(
      existingColumnsById,
      columnInput.id
    );
    return createDraftColumn(
      boardId,
      columnInput,
      existingColumn,
      index,
      occupiedGeneratedKeys
    );
  });
};

const assertDraftColumnsAreValid = (
  board: Board,
  draftColumns: Column[]
): void => {
  const validationResult = validateBoardWithColumns(board, draftColumns);
  if (validationResult.success) {
    return;
  }

  throw createDomainRuleError(
    validationResult.error.code,
    validationResult.error.message,
    validationResult.error.field
  );
};

const computeTemporaryPositionBase = (
  existingColumns: Column[],
  inputColumns: ConfigureColumnsInput["columns"]
): number => {
  return (
    Math.max(
      -1,
      ...existingColumns.map((column) => column.position),
      ...inputColumns.map((column) => column.position)
    ) +
    inputColumns.length +
    1
  );
};

const shouldStageTemporaryKey = (
  existingColumn: Column | undefined,
  draftColumn: Column
): existingColumn is Column => {
  return (
    !!existingColumn &&
    normalizeColumnKey(existingColumn.key) !==
      normalizeColumnKey(draftColumn.key)
  );
};

const stageExistingColumnReorders = async (
  repository: BoardRepository,
  inputColumns: ConfigureColumnsInput["columns"],
  existingColumnsById: ColumnsById,
  temporaryPositionBase: number
): Promise<void> => {
  for (const [index, columnInput] of inputColumns.entries()) {
    const existingColumn = findExistingColumn(
      existingColumnsById,
      columnInput.id
    );
    if (!existingColumn || existingColumn.position === columnInput.position) {
      continue;
    }

    await repository.updateColumn(existingColumn.id, {
      position: temporaryPositionBase + index,
    });
  }
};

const stageExistingColumnKeySwaps = async (
  repository: BoardRepository,
  draftColumns: Column[],
  existingColumnsById: ColumnsById
): Promise<void> => {
  for (const draftColumn of draftColumns) {
    const existingColumn = existingColumnsById.get(draftColumn.id);
    if (!shouldStageTemporaryKey(existingColumn, draftColumn)) {
      continue;
    }

    await repository.updateColumn(draftColumn.id, {
      key: `${TEMP_COLUMN_KEY_PREFIX}${draftColumn.id}`,
    });
  }
};

const deleteColumns = async (
  repository: BoardRepository,
  columnsToDelete: Column[]
): Promise<void> => {
  for (const column of columnsToDelete) {
    await repository.deleteColumn(column.id);
  }
};

const persistDraftColumns = async (
  repository: BoardRepository,
  boardId: string,
  draftColumns: Column[],
  existingColumnsById: ColumnsById
): Promise<void> => {
  for (const draftColumn of draftColumns) {
    const existingColumn = existingColumnsById.get(draftColumn.id);

    if (!existingColumn) {
      await repository.createColumn({
        boardId,
        name: draftColumn.name,
        key: draftColumn.key,
        state: draftColumn.state,
        position: draftColumn.position,
        visible: draftColumn.visible,
      });
      continue;
    }

    await repository.updateColumn(draftColumn.id, {
      name: draftColumn.name,
      key: draftColumn.key,
      state: draftColumn.state,
      position: draftColumn.position,
      visible: draftColumn.visible,
    });
  }
};

export const getOrCreateBoard = async (
  repository: BoardRepository,
  projectId: string
): Promise<Board> => {
  const existingBoard = await repository.findByProject(projectId);
  if (existingBoard) {
    return existingBoard;
  }

  return repository.create({ projectId });
};

export const buildConfigureColumnsContext = (
  existingColumns: Column[],
  inputColumns: ConfigureColumnsInput["columns"]
) => {
  const existingColumnsById = indexColumnsById(existingColumns);
  const columnIdsToKeep = collectColumnIdsToKeep(inputColumns);
  const columnsToDelete = findColumnsToDelete(existingColumns, columnIdsToKeep);

  return {
    existingColumnsById,
    columnsToDelete,
  };
};

export const buildValidatedDraftColumns = (
  board: Board,
  inputColumns: ConfigureColumnsInput["columns"],
  existingColumnsById: ColumnsById
): Column[] => {
  const draftColumns = buildDraftColumns(
    board.id,
    inputColumns,
    existingColumnsById
  );
  assertDraftColumnsAreValid(board, draftColumns);
  return draftColumns;
};

export const assertColumnsCanBeDeleted = async (
  repository: BoardRepository,
  columnsToDelete: Column[]
): Promise<void> => {
  if (columnsToDelete.length === 0) {
    return;
  }

  const ticketCounts =
    (await repository.countTicketsByColumnIds(
      columnsToDelete.map((column) => column.id)
    )) ?? {};
  const blockedColumn = columnsToDelete.find(
    (column) => (ticketCounts[column.id] ?? 0) > 0
  );

  if (!blockedColumn) {
    return;
  }

  throw createDomainRuleError(
    "COLUMN_IN_USE",
    `Column ${blockedColumn.id} cannot be deleted while tickets still reference it`,
    "columns"
  );
};

export const applyConfigureColumnsPlan = async (
  repository: BoardRepository,
  params: {
    boardId: string;
    inputColumns: ConfigureColumnsInput["columns"];
    existingColumns: Column[];
    existingColumnsById: ColumnsById;
    columnsToDelete: Column[];
    draftColumns: Column[];
  }
): Promise<void> => {
  const temporaryPositionBase = computeTemporaryPositionBase(
    params.existingColumns,
    params.inputColumns
  );

  await stageExistingColumnReorders(
    repository,
    params.inputColumns,
    params.existingColumnsById,
    temporaryPositionBase
  );
  await stageExistingColumnKeySwaps(
    repository,
    params.draftColumns,
    params.existingColumnsById
  );
  await deleteColumns(repository, params.columnsToDelete);
  await persistDraftColumns(
    repository,
    params.boardId,
    params.draftColumns,
    params.existingColumnsById
  );
};
