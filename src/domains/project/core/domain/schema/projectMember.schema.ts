import { z } from "zod";

import { UserProfileSchema } from "@/domains/profile/core/domain/schema/userProfile.schema";
import { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";

/**
 * Zod schema for ProjectMember entity.
 * Represents a user's membership in a project with their role and profile data.
 */
export const ProjectMemberSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.nativeEnum(ProjectRole),
  profile: UserProfileSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/** A project member with their role and public profile information. */
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;

/**
 * Input for updating a member's role.
 * Only admins can change roles; a project must keep at least one admin.
 */
export const UpdateMemberRoleInputSchema = z.object({
  memberId: z.string().uuid(),
  role: z.nativeEnum(ProjectRole),
});

export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleInputSchema>;

/**
 * Input for removing a member from a project.
 * The last admin cannot be removed (enforced at usecase level).
 */
export const RemoveMemberInputSchema = z.object({
  memberId: z.string().uuid(),
});

export type RemoveMemberInput = z.infer<typeof RemoveMemberInputSchema>;
