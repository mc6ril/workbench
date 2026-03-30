import { toDate } from "@/shared/utils/guards";

import type { UserProfileRow } from "@/domains/profile/infrastructure/types";
import { mapUserProfileRowToDomain } from "@/domains/profile/infrastructure/UserProfileMapper.supabase";
import { type ProjectMember,ProjectRole } from "@/domains/project/core/domain/project.types";
import type { ProjectMemberRow } from "@/domains/project/infrastructure/supabase/types";

/**
 * Maps project member and user profile rows to a domain ProjectMember.
 */
export const mapMemberRowsToDomain = (
  memberRow: ProjectMemberRow,
  profileRow: UserProfileRow
): ProjectMember => {
  return {
    id: memberRow.id,
    projectId: memberRow.project_id,
    userId: memberRow.user_id,
    role: memberRow.role as ProjectRole,
    profile: mapUserProfileRowToDomain(profileRow),
    createdAt: toDate(memberRow.created_at),
    updatedAt: toDate(memberRow.updated_at),
  };
};
