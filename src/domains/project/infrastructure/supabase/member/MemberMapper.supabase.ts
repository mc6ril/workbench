import { createDatabaseError } from "@/shared/errors/repositoryError";
import { toDate } from "@/shared/utils/guards";

import type { UserProfileRow } from "@/domains/profile/infrastructure/types";
import {
  isProjectRole,
  type MemberProfile,
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

const mapMemberProfile = (row: UserProfileRow): MemberProfile => ({
  id: row.id,
  email: row.email,
  displayName: row.display_name,
  avatarUrl: row.avatar_url,
});

export const mapMemberRowsToDomain = (
  memberRow: ProjectMemberRow,
  profileRow: UserProfileRow
): ProjectMember => {
  return {
    id: memberRow.id,
    projectId: memberRow.project_id,
    userId: memberRow.user_id,
    role: mapProjectMemberRole(memberRow.role),
    profile: mapMemberProfile(profileRow),
    createdAt: toDate(memberRow.created_at),
    updatedAt: toDate(memberRow.updated_at),
  };
};
