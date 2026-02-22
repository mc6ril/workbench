import { ProjectRole } from "@/core/domain/schema/project.schema";
import type { ProjectMember } from "@/core/domain/schema/projectMember.schema";

import type { ProjectMemberJoinRow } from "@/infrastructure/supabase/types";
import { mapUserProfileRowToDomain } from "@/infrastructure/supabase/userProfile/UserProfileMapper.supabase";

import { toDate } from "@/shared/utils/guards";

/**
 * Maps a joined project_members + user_profiles row to a domain ProjectMember.
 */
export const mapMemberJoinRowToDomain = (
  row: ProjectMemberJoinRow
): ProjectMember => {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    role: row.role as ProjectRole,
    profile: mapUserProfileRowToDomain(row.user_profiles),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
};
