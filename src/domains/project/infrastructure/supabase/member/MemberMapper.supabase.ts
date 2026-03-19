import type {
  ProjectMemberRow,
  UserProfileRow,
} from "@/shared/infrastructure/types";
import { toDate } from "@/shared/utils/guards";

import { mapUserProfileRowToDomain } from "@/domains/auth/infrastructure/supabase/userProfile/UserProfileMapper.supabase";
import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import { ProjectRole } from "@/domains/workspace/core/domain/schema/project.schema";

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
