import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProjectRole } from "@/core/domain/schema/project.schema";
import type { ProjectMember } from "@/core/domain/schema/projectMember.schema";

import { handleRepositoryError } from "@/infrastructure/supabase/shared/errors/errorHandlers";
import type { ProjectMemberJoinRow } from "@/infrastructure/supabase/types";

import { mapMemberJoinRowToDomain } from "./MemberMapper.supabase";

import type { MemberRepository } from "@/core/ports/memberRepository";

/**
 * Create a MemberRepository implementation using the provided Supabase client.
 *
 * @param client - Supabase client instance to use
 * @returns MemberRepository implementation
 */
export const createMemberRepository = (
  client: SupabaseClient
): MemberRepository => ({
  async listByProject(projectId: string): Promise<ProjectMember[]> {
    const { data, error } = await client
      .from("project_members")
      .select(
        `
        id,
        project_id,
        user_id,
        role,
        created_at,
        updated_at,
        user_profiles!inner (
          id,
          email,
          display_name,
          avatar_url,
          created_at,
          updated_at
        )
      `
      )
      .eq("project_id", projectId)
      .order("role", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return handleRepositoryError(error, "ProjectMember");
    }

    return (data as unknown as ProjectMemberJoinRow[]).map(
      mapMemberJoinRowToDomain
    );
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
