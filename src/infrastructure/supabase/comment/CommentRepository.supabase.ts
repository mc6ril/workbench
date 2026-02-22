import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createDatabaseError,
  createNotFoundError,
} from "@/core/domain/repositoryError";
import type {
  CommentWithAuthor,
  CreateCommentInput,
  UpdateCommentInput,
} from "@/core/domain/schema/comment.schema";

import { handleRepositoryError } from "@/infrastructure/supabase/shared/errors/errorHandlers";
import type { CommentWithAuthorRow } from "@/infrastructure/supabase/types";

import {
  mapCommentWithAuthorRowsToDomain,
  mapCommentWithAuthorRowToDomain,
} from "./CommentMapper.supabase";

import type { CommentRepository } from "@/core/ports/commentRepository";

/**
 * Create a CommentRepository implementation using the provided Supabase client.
 */
export const createCommentRepository = (
  client: SupabaseClient
): CommentRepository => ({
  async listByTicket(ticketId: string): Promise<CommentWithAuthor[]> {
    try {
      const { data, error } = await client.rpc("get_ticket_comments", {
        p_ticket_id: ticketId,
      });

      if (error) {
        return handleRepositoryError(error, "Comment");
      }

      return mapCommentWithAuthorRowsToDomain(
        (data ?? []) as CommentWithAuthorRow[]
      );
    } catch (error) {
      return handleRepositoryError(error, "Comment");
    }
  },

  async create(input: CreateCommentInput): Promise<CommentWithAuthor> {
    try {
      const currentUser = await client.auth.getUser();
      const authorId = currentUser.data.user?.id;

      if (!authorId) {
        return handleRepositoryError(
          createDatabaseError("User not authenticated"),
          "Comment"
        );
      }

      const { data, error } = await client
        .from("comments")
        .insert({
          ticket_id: input.ticketId,
          author_id: authorId,
          content: input.content,
        })
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Comment");
      }

      if (!data) {
        return handleRepositoryError(
          createDatabaseError("No data returned from insert"),
          "Comment"
        );
      }

      // Re-fetch with author profile data via RPC
      const { data: enriched, error: rpcError } = await client.rpc(
        "get_ticket_comments",
        { p_ticket_id: input.ticketId }
      );

      if (rpcError) {
        return handleRepositoryError(rpcError, "Comment");
      }

      const created = (enriched as CommentWithAuthorRow[]).find(
        (c) => c.id === (data as { id: string }).id
      );

      if (!created) {
        return handleRepositoryError(
          createDatabaseError("Created comment not found in RPC result"),
          "Comment"
        );
      }

      return mapCommentWithAuthorRowToDomain(created);
    } catch (error) {
      return handleRepositoryError(error, "Comment");
    }
  },

  async update(
    id: string,
    input: UpdateCommentInput
  ): Promise<CommentWithAuthor> {
    try {
      const { data, error } = await client
        .from("comments")
        .update({ content: input.content })
        .eq("id", id)
        .select("*, user_profiles:author_id(display_name, avatar_url)")
        .single();

      if (error) {
        return handleRepositoryError(error, "Comment", id);
      }

      if (!data) {
        return handleRepositoryError(
          createNotFoundError("Comment", id),
          "Comment",
          id
        );
      }

      const row = data as CommentWithAuthorRow;
      return mapCommentWithAuthorRowToDomain(row);
    } catch (error) {
      return handleRepositoryError(error, "Comment", id);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await client.from("comments").delete().eq("id", id);

      if (error) {
        return handleRepositoryError(error, "Comment", id);
      }
    } catch (error) {
      return handleRepositoryError(error, "Comment", id);
    }
  },
});
