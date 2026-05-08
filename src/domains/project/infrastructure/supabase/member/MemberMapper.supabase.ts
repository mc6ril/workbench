import { createDatabaseError } from "@/shared/errors/repositoryError";
import { toDate } from "@/shared/utils/guards";

import type { UserProfileRow } from "@/domains/profile/infrastructure/types";
import { mapUserProfileRowToDomain } from "@/domains/profile/infrastructure/UserProfileMapper.supabase";
import {
  isProjectRole,
  type ProjectMember,
  ProjectRole,
} from "@/domains/project/core/domain/project.types";
import type { ProjectMemberRow } from "@/domains/project/infrastructure/supabase/types";

const mapProjectMemberRole = (value: string): ProjectRole => {
  if (isProjectRole(value)) {
    return value;
  }

  throw createDatabaseError(`Invalid project member role: ${value}`);
};

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
    role: mapProjectMemberRole(memberRow.role),
    profile: mapUserProfileRowToDomain(profileRow),
    createdAt: toDate(memberRow.created_at),
    updatedAt: toDate(memberRow.updated_at),
  };
};
