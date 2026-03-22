import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createConstraintError,
  createDatabaseError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import { mapMemberRowsToDomain } from "./MemberMapper.supabase";

import type { UserProfileRow } from "@/domains/profile/infrastructure/supabase/userProfile/types";
import type { Project } from "@/domains/project/core/domain/schema/project.schema";
import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import type { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
import { isProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
import type { MemberRepository } from "@/domains/project/core/ports/memberRepository";
import { mapProjectRowToDomain } from "@/domains/project/infrastructure/supabase/project/ProjectMapper.supabase";
import type { ProjectRow } from "@/domains/project/infrastructure/supabase/types";
import type { ProjectMemberRow } from "@/domains/project/infrastructure/supabase/types";

/**
 * Extract a full project row from an RPC response.
 * The RPC may return a single object or an array of objects.
 */
const extractProjectRow = (data: unknown): ProjectRow | null => {
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if (typeof first === "object" && first !== null) {
      return first as ProjectRow;
    }
  } else if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as ProjectRow;
  }

  return null;
};

/**
 * Create a MemberRepository implementation using the provided Supabase client.
 *
 * @param client - Supabase client instance to use
 * @returns MemberRepository implementation
 */
export const createMemberRepository = (
  client: SupabaseClient
): MemberRepository => ({
  async addCurrentUserAsMember(
    projectId: string,
    _role?: ProjectRole
  ): Promise<Project> {
    try {
      const { data, error } = await client.rpc("reclaim_or_join_project", {
        project_uuid: projectId,
      });

      if (error) {
        if (error.code === "P0002") {
          return handleRepositoryError(
            createNotFoundError("Project", projectId),
            "Project"
          );
        }

        if (error.code === "23505") {
          return handleRepositoryError(
            createConstraintError(
              "ALREADY_MEMBER",
              "User is already a member of this project"
            ),
            "Project"
          );
        }

        return handleRepositoryError(error, "Project");
      }

      const projectRow = extractProjectRow(data);
      if (!projectRow) {
        return handleRepositoryError(
          createNotFoundError("Project", projectId),
          "Project"
        );
      }

      return mapProjectRowToDomain(projectRow);
    } catch (error) {
      return handleRepositoryError(error, "Project");
    }
  },

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
