import {
  createDatabaseError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";
import { isObject } from "@/shared/utils/guards";

import type { ProjectRow } from "@/domains/project/infrastructure/supabase/types";

const firstPayloadItem = (payload: unknown): unknown => {
  if (Array.isArray(payload)) {
    return payload[0] ?? null;
  }

  return payload;
};

export const isProjectRow = (value: unknown): value is ProjectRow => {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.short_code === "string" &&
    typeof value.board_emoji === "string" &&
    Array.isArray(value.enabled_modules) &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
};

export const extractProjectRowFromPayload = (
  payload: unknown
): ProjectRow | null => {
  const row = firstPayloadItem(payload);
  return isProjectRow(row) ? row : null;
};

export const extractProjectIdFromPayload = (
  payload: unknown
): string | null => {
  const value = firstPayloadItem(payload);

  if (typeof value === "string") {
    return value;
  }

  if (isObject(value) && typeof value.id === "string") {
    return value.id;
  }

  return null;
};

export const fetchProjectRowById = async (
  client: AppSupabaseClient,
  projectId: string
): Promise<ProjectRow> => {
  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    return handleRepositoryError(error, "Project", projectId);
  }

  if (!data) {
    return handleRepositoryError(
      createNotFoundError("Project", projectId),
      "Project",
      projectId
    );
  }

  if (!isProjectRow(data)) {
    return handleRepositoryError(
      createDatabaseError("Invalid project payload"),
      "Project",
      projectId
    );
  }

  return data;
};
