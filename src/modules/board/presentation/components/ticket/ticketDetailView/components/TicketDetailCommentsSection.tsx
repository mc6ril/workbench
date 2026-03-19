import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import Text from "@/shared/design-system/text";
import Textarea from "@/shared/design-system/textarea";
import Title from "@/shared/design-system/title";
import { useTranslation } from "@/shared/i18n";

import type { CommentWithAuthor } from "@/modules/board/core/domain/schema/comment.schema";
import styles from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";

type Props = {
  comments: CommentWithAuthor[];
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

  return (
    <div className={styles["ticket-detail__comments"]}>
      <Title variant="h3">{t("comments.title")}</Title>
      <Textarea
        label={t("comments.newLabel")}
        value={commentInput}
        rows={3}
        helperText={canComment ? undefined : t("comments.readOnlyHint")}
        disabled={!canComment || isCreatingComment}
        onChange={(event) => {
          onCommentInputChange(event.target.value);
        }}
      />
      <Button
        label={t("comments.addButton")}
        variant="publish"
        onClick={onCreateComment}
        disabled={
          !canComment || isCreatingComment || commentInput.trim().length === 0
        }
      />

      <div className={styles["ticket-detail__comment-list"]}>
        {comments.map((comment) => {
          const canEdit = canComment && comment.authorId === sessionUserId;
          const isEditing = editingCommentId === comment.id;

          return (
            <Card key={comment.id} className={styles["ticket-detail__comment"]}>
              <Text variant="caption">
                {t("comments.author", {
                  author:
                    comment.authorDisplayName ?? t("comments.unknownAuthor"),
                })}
              </Text>

              {isEditing ? (
                <Textarea
                  label={t("comments.editLabel")}
                  value={editingCommentContent}
                  rows={3}
                  onChange={(event) => {
                    onEditingCommentContentChange(event.target.value);
                  }}
                />
              ) : (
                <Text variant="body">{comment.content}</Text>
              )}

              {canEdit ? (
                <div className={styles["ticket-detail__comment-actions"]}>
                  {isEditing ? (
                    <>
                      <Button
                        label={t("comments.saveEdit")}
                        variant="save"
                        onClick={() => {
                          onSaveComment(comment.id);
                        }}
                        disabled={isUpdatingComment}
                      />
                      <Button
                        label={tCommon("cancel")}
                        variant="secondary"
                        onClick={onCancelCommentEditing}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        label={t("comments.editButton")}
                        variant="edit"
                        onClick={() => {
                          onStartCommentEditing(comment.id, comment.content);
                        }}
                      />
                      <Button
                        label={t("comments.deleteButton")}
                        variant="delete"
                        onClick={() => {
                          onDeleteComment(comment.id);
                        }}
                        disabled={isDeletingComment}
                      />
                    </>
                  )}
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TicketDetailCommentsSection;
