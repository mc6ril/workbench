import { ProjectRole } from "@/core/domain/schema/project.schema";
import type { ProjectMember } from "@/core/domain/schema/projectMember.schema";

import type { ProjectMemberJoinRow } from "@/infrastructure/supabase/types";

import { toDate } from "@/shared/utils/guards";

/**
 * Maps a joined project_members + user_profiles row to a domain ProjectMember.
 */
export const mapMemberJoinRowToDomain = (
  row: ProjectMemberJoinRow
): ProjectMember => {
  const profile = row.user_profiles;

  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    role: row.role as ProjectRole,
    profile: {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      createdAt: toDate(profile.created_at),
      updatedAt: toDate(profile.updated_at),
    },
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
};
