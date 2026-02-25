import { ProjectRole } from "@/core/domain/schema/project.schema";
import type { ProjectMember } from "@/core/domain/schema/projectMember.schema";

import type {
  ProjectMemberRow,
  UserProfileRow,
} from "@/infrastructure/supabase/types";
import { mapUserProfileRowToDomain } from "@/infrastructure/supabase/userProfile/UserProfileMapper.supabase";

import { toDate } from "@/shared/utils/guards";

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
