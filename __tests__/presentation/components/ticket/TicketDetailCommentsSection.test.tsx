import { render, screen } from "@testing-library/react";

import { ProjectRole } from "@/domains/project/core/domain/project.types";
import TicketDetailCommentsSection from "@/modules/board/presentation/components/ticket/ticketDetailView/components/TicketDetailCommentsSection";

describe("TicketDetailCommentsSection", () => {
  it("falls back to the project member email when the comment has no display name", () => {
    render(
      <TicketDetailCommentsSection
        comments={[
          {
            id: "comment-1",
            ticketId: "ticket-1",
            authorId: "user-1",
            content: "Message de test",
            authorDisplayName: null,
            authorAvatarUrl: null,
            createdAt: new Date("2026-03-20T10:00:00.000Z"),
            updatedAt: new Date("2026-03-20T10:00:00.000Z"),
          },
        ]}
        projectMembers={[
          {
            id: "member-1",
            projectId: "project-1",
            userId: "user-1",
            role: ProjectRole.MEMBER,
            profile: {
              id: "user-1",
              email: "author@example.com",
              displayName: null,
              avatarUrl: null,
            },
            createdAt: new Date("2026-03-20T10:00:00.000Z"),
            updatedAt: new Date("2026-03-20T10:00:00.000Z"),
          },
        ]}
        sessionUserId="user-1"
        canComment
        commentInput=""
        editingCommentId={null}
        editingCommentContent=""
        isCreatingComment={false}
        isUpdatingComment={false}
        isDeletingComment={false}
        onCommentInputChange={() => {}}
        onCreateComment={() => {}}
        onEditingCommentContentChange={() => {}}
        onStartCommentEditing={() => {}}
        onCancelCommentEditing={() => {}}
        onSaveComment={() => {}}
        onDeleteComment={() => {}}
      />
    );

    expect(screen.getByText("Auteur : author@example.com")).toBeInTheDocument();
    expect(screen.getByText("Message de test")).toBeInTheDocument();
  });
});
