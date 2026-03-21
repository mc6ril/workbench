import type { SupabaseClient } from "@supabase/supabase-js";

import { createDatabaseError } from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import { isProjectRole } from "@/shared/utils/guards";

import { mapMemberRowsToDomain } from "./MemberMapper.supabase";

import type { UserProfileRow } from "@/domains/profile/infrastructure/supabase/userProfile/types";
import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import type { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
import type { MemberRepository } from "@/domains/project/core/ports/memberRepository";
import type { ProjectMemberRow } from "@/domains/project/infrastructure/supabase/types";

/**
 * Create a MemberRepository implementation using the provided Supabase client.
 *
 * @param client - Supabase client instance to use
 * @returns MemberRepository implementation
 */
export const createMemberRepository = (
  client: SupabaseClient
): MemberRepository => ({
  async getCurrentRole(projectId: string): Promise<ProjectRole | null> {
    const { data, error } = await client.rpc("get_project_role", {
      project_uuid: projectId,
    });

    if (error) {
      return handleRepositoryError(error, "ProjectMember");
    }

    if (data == null) {
      return null;
    }

    if (typeof data !== "string" || !isProjectRole(data)) {
      return handleRepositoryError(
        createDatabaseError(`Invalid project role: ${String(data)}`),
        "ProjectMember"
      );
    }

    return data;
  },

  async listByProject(projectId: string): Promise<ProjectMember[]> {
    const { data: membersData, error: membersError } = await client
      .from("project_members")
      .select(
        `
        id,
        project_id,
        user_id,
        role,
        created_at,
        updated_at
      `
      )
      .eq("project_id", projectId)
      .order("role", { ascending: true })
      .order("created_at", { ascending: true });

    if (membersError) {
      return handleRepositoryError(membersError, "ProjectMember");
    }

    const memberRows = (membersData ?? []) as ProjectMemberRow[];
    const userIds = [...new Set(memberRows.map((member) => member.user_id))];

    if (userIds.length === 0) {
      return [];
    }

    // We load profiles in a second query because project_members.user_id is not
    // guaranteed to have a direct FK relation to user_profiles in all environments.
    const { data: profilesData, error: profilesError } = await client
      .from("user_profiles")
      .select(
        `
        id,
        email,
        display_name,
        avatar_url,
        preferences,
        terms_accepted_at,
        created_at,
        updated_at
      `
      )
      .in("id", userIds);

    if (profilesError) {
      return handleRepositoryError(profilesError, "ProjectMember");
    }

    const profilesById = new Map(
      ((profilesData ?? []) as UserProfileRow[]).map((profile) => [
        profile.id,
        profile,
      ])
    );

    return memberRows.flatMap((memberRow) => {
      const profileRow = profilesById.get(memberRow.user_id);
      if (!profileRow) {
        return [];
      }

      return [mapMemberRowsToDomain(memberRow, profileRow)];
    });
  },

  async updateRole(memberId: string, role: ProjectRole): Promise<void> {
    const { error } = await client
      .from("project_members")
      .update({ role })
      .eq("id", memberId);

    if (error) {
      return handleRepositoryError(error, "ProjectMember", memberId);
    }
  },

  async remove(memberId: string): Promise<void> {
    const { error } = await client
      .from("project_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      return handleRepositoryError(error, "ProjectMember", memberId);
    }
  },

  async countAdmins(projectId: string): Promise<number> {
    const { count, error } = await client
      .from("project_members")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("role", "admin");

    if (error) {
      return handleRepositoryError(error, "ProjectMember");
    }

    return count ?? 0;
  },
});
