import { toDate } from "@/shared/utils/guards";

import {
  InvitationStatus,
  type ProjectInvitation,
  ProjectRole,
} from "@/domains/project/core/domain/project.types";
import type { InvitationRow } from "@/domains/project/infrastructure/supabase/types";

/**
 * Maps a Supabase row to a domain ProjectInvitation.
 */
export const mapInvitationRowToDomain = (
  row: InvitationRow
): ProjectInvitation => ({
  id: row.id,
  projectId: row.project_id,
  role: row.role as ProjectRole,
  status: row.status as InvitationStatus,
  token: row.token,
  invitedBy: row.invited_by,
  expiresAt: toDate(row.expires_at),
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});
