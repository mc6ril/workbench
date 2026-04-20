import type { SupabaseClient } from "@supabase/supabase-js";

import { createQueryBuilderMock } from "../testUtils/queryBuilderMock";

import { createCommentRepository } from "@/modules/board/infrastructure/supabase/comment/CommentRepository.supabase";

describe("CommentRepository.supabase hasByProject", () => {
  const projectId = "223e4567-e89b-12d3-a456-426614174000";

  it("checks for project comments directly through comments.project_id", async () => {
    const commentsQuery = createQueryBuilderMock<Array<{ id: string }>>([
      { id: "comment-1" },
    ]);
    const client = {
      from: jest.fn(() => commentsQuery),
    } as unknown as SupabaseClient;

    const repository = createCommentRepository(client);

    await expect(repository.hasByProject(projectId)).resolves.toBe(true);

    expect(client.from).toHaveBeenCalledWith("comments");
    expect(commentsQuery.select).toHaveBeenCalledWith("id");
    expect(commentsQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(commentsQuery.limit).toHaveBeenCalledWith(1);
  });

  it("returns false when the project-scoped comment query finds no rows", async () => {
    const commentsQuery = createQueryBuilderMock<Array<{ id: string }>>([]);
    const client = {
      from: jest.fn(() => commentsQuery),
    } as unknown as SupabaseClient;

    const repository = createCommentRepository(client);

    await expect(repository.hasByProject(projectId)).resolves.toBe(false);
  });
});
