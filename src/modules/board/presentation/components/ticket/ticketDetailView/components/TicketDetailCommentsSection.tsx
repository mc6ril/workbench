import Avatar from "@/shared/design-system/avatar";
import { getIntlLocale, useTranslation } from "@/shared/i18n";

import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import type { CommentWithAuthor } from "@/modules/board/core/domain/schema/comment.schema";
import styles from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";

type Props = {
  comments: CommentWithAuthor[];
  projectMembers: ProjectMember[];
  sessionUserId?: string;
  canComment: boolean;
  commentInput: string;
  editingCommentId: string | null;
  editingCommentContent: string;
  isCreatingComment: boolean;
  isUpdatingComment: boolean;
  isDeletingComment: boolean;
  onCommentInputChange: (value: string) => void;
  onCreateComment: () => void;
  onEditingCommentContentChange: (value: string) => void;
  onStartCommentEditing: (commentId: string, content: string) => void;
  onCancelCommentEditing: () => void;
  onSaveComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
};

const TicketDetailCommentsSection = ({
  comments,
  projectMembers,
  sessionUserId,
  canComment,
  commentInput,
  editingCommentId,
  editingCommentContent,
  isCreatingComment,
  isUpdatingComment,
  isDeletingComment,
  onCommentInputChange,
  onCreateComment,
  onEditingCommentContentChange,
  onStartCommentEditing,
  onCancelCommentEditing,
  onSaveComment,
  onDeleteComment,
}: Props) => {
  const t = useTranslation("pages.ticketDetail.page");
  const tCommon = useTranslation("common");
  const intlLocale = getIntlLocale();
  const commentDateFormatter = new Intl.DateTimeFormat(intlLocale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className={styles["ticket-detail__section"]}>
      <div className={styles["ticket-detail__section-header"]}>
        <span className={styles["ticket-detail__section-label"]}>
          {t("comments.title")}
        </span>
      </div>
      <div className={styles["ticket-detail__comment-list"]}>
        {comments.map((comment) => {
          const canEdit = canComment && comment.authorId === sessionUserId;
          const isEditing = editingCommentId === comment.id;
          const authorMember = projectMembers.find(
            (projectMember) => projectMember.userId === comment.authorId
          );
          const authorName =
            comment.authorDisplayName ??
            authorMember?.profile.displayName ??
            authorMember?.profile.email ??
            t("comments.unknownAuthor");
          const authorAvatarUrl =
            comment.authorAvatarUrl ?? authorMember?.profile.avatarUrl ?? null;

          return (
            <article
              key={comment.id}
              className={styles["ticket-detail__comment"]}
            >
              <Avatar
                src={authorAvatarUrl}
                name={authorName}
                size="sm"
                aria-label={authorName}
              />

              <div className={styles["ticket-detail__comment-body"]}>
                <div className={styles["ticket-detail__comment-header"]}>
                  <span className={styles["ticket-detail__comment-author"]}>
                    {t("comments.author", { author: authorName })}
                  </span>
                  <span className={styles["ticket-detail__comment-time"]}>
                    {commentDateFormatter.format(comment.createdAt)}
                  </span>
                </div>

                {isEditing ? (
                  <textarea
                    className={styles["ticket-detail__comment-editor"]}
                    aria-label={t("comments.editLabel")}
                    rows={3}
                    value={editingCommentContent}
                    onChange={(event) => {
                      onEditingCommentContentChange(event.target.value);
                    }}
                  />
                ) : (
                  <p className={styles["ticket-detail__comment-text"]}>
                    {comment.content}
                  </p>
                )}

                {canEdit ? (
                  <div className={styles["ticket-detail__comment-actions"]}>
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className={styles["ticket-detail__comment-action"]}
                          onClick={() => {
                            onSaveComment(comment.id);
                          }}
                          disabled={isUpdatingComment}
                        >
                          {t("comments.saveEdit")}
                        </button>
                        <button
                          type="button"
                          className={styles["ticket-detail__comment-action"]}
                          onClick={onCancelCommentEditing}
                        >
                          {tCommon("cancel")}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles["ticket-detail__comment-action"]}
                          onClick={() => {
                            onStartCommentEditing(comment.id, comment.content);
                          }}
                        >
                          {t("comments.editButton")}
                        </button>
                        <button
                          type="button"
                          className={[
                            styles["ticket-detail__comment-action"],
                            styles["ticket-detail__comment-action--danger"],
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => {
                            onDeleteComment(comment.id);
                          }}
                          disabled={isDeletingComment}
                        >
                          {t("comments.deleteButton")}
                        </button>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles["ticket-detail__comment-composer"]}>
        <div className={styles["ticket-detail__comment-composer-body"]}>
          <textarea
            className={styles["ticket-detail__comment-input"]}
            aria-label={t("comments.newLabel")}
            placeholder={t("comments.newPlaceholder")}
            rows={2}
            value={commentInput}
            disabled={!canComment || isCreatingComment}
            onChange={(event) => {
              onCommentInputChange(event.target.value);
            }}
          />
          {!canComment ? (
            <p className={styles["ticket-detail__comment-hint"]}>
              {t("comments.readOnlyHint")}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className={styles["ticket-detail__comment-send"]}
          onClick={onCreateComment}
          aria-label={t("comments.addButton")}
          disabled={
            !canComment || isCreatingComment || commentInput.trim().length === 0
          }
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M14 8L2 14l4-6-4-6L14 8z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TicketDetailCommentsSection;
