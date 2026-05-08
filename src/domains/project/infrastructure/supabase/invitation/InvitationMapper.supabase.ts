import { createDatabaseError } from "@/shared/errors/repositoryError";
import { toDate } from "@/shared/utils/guards";

import {
  InvitationStatus,
  isInvitationStatus,
  isProjectRole,
  type ProjectInvitation,
  ProjectRole,
} from "@/domains/project/core/domain/project.types";
import type { InvitationRow } from "@/domains/project/infrastructure/supabase/types";

const mapInvitationRole = (value: string): ProjectRole => {
  if (isProjectRole(value)) {
    return value;
  }

  throw createDatabaseError(`Invalid invitation role: ${value}`);
};

const mapInvitationStatus = (value: string): InvitationStatus => {
  if (isInvitationStatus(value)) {
    return value;
  }

  throw createDatabaseError(`Invalid invitation status: ${value}`);
};

/**
 * Maps a Supabase row to a domain ProjectInvitation.
 */
export const mapInvitationRowToDomain = (
  row: InvitationRow
): ProjectInvitation => ({
  id: row.id,
  projectId: row.project_id,
  role: mapInvitationRole(row.role),
  status: mapInvitationStatus(row.status),
  token: row.token,
  invitedBy: row.invited_by,
  expiresAt: toDate(row.expires_at),
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});
