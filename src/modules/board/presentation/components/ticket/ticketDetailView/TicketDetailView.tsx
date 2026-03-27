"use client";

import React, { useMemo } from "react";

import Card from "@/shared/design-system/card";
import Loader from "@/shared/design-system/loader";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslation } from "@/shared/i18n";

import TicketDetailCommentsSection from "./components/TicketDetailCommentsSection";
import TicketDetailDeleteModal from "./components/TicketDetailDeleteModal";
import TicketDetailMainCard from "./components/TicketDetailMainCard";
import TicketDetailSidebarCard from "./components/TicketDetailSidebarCard";
import styles from "./TicketDetailView.module.scss";
import { buildPriorityOptions } from "./TicketDetailView.utils";

import { useTicketDetailController } from "@/modules/board/presentation/hooks/ticket";

type Props = {
  projectId: string;
  ticketId: string;
};

const TicketDetailView = ({ projectId, ticketId }: Props) => {
  const t = useTranslation("pages.ticketDetail.page");

  const {
    ticket,
    error,
    sessionUserId,
    isLoading,
    canComment,
    canDeleteTicket,
    canEditTicket,
    comments,
    projectMembers,
    assignees,
    statusOptions,
    effectiveTitle,
    effectiveDescription,
    effectiveStatus,
    effectivePriority,
    commentInput,
    editingCommentId,
    editingCommentContent,
    isDeleteModalOpen,
    isCreatingComment,
    isUpdatingComment,
    isDeletingComment,
    isSavingMainFields,
    isDeletingTicket,
    isUpdatingAssignees,
    setTitleDraft,
    setDescriptionDraft,
    setStatusDraft,
    setPriorityDraft,
    setCommentInput,
    setEditingCommentContent,
    setIsDeleteModalOpen,
    handleSaveMainFields,
    handleAssign,
    handleUnassign,
    handleCreateComment,
    handleStartCommentEditing,
    handleCancelCommentEditing,
    handleSaveComment,
    handleDeleteComment,
    handleDeleteTicket,
  } = useTicketDetailController({
    projectId,
    ticketId,
  });

  const priorityOptions = useMemo(() => {
    return buildPriorityOptions(t);
  }, [t]);

  const canSaveMainFields =
    canEditTicket && effectiveTitle.trim().length > 0 && !isSavingMainFields;

  if (isLoading) {
    return <Loader variant="full-page" />;
  }

  if (!ticket || error) {
    return (
      <Card className={styles["ticket-detail__error"]}>
        <Title variant="h2">{t("states.errorTitle")}</Title>
        <Text variant="body">{t("states.errorMessage")}</Text>
      </Card>
    );
  }

  return (
    <section className={styles["ticket-detail"]}>
      <div className={styles["ticket-detail__grid"]}>
        <TicketDetailMainCard
          title={effectiveTitle}
          description={effectiveDescription}
          canEditTicket={canEditTicket}
          onTitleChange={setTitleDraft}
          onDescriptionChange={setDescriptionDraft}
          commentsSection={
            <TicketDetailCommentsSection
              comments={comments}
              projectMembers={projectMembers}
              sessionUserId={sessionUserId}
              canComment={canComment}
              commentInput={commentInput}
              editingCommentId={editingCommentId}
              editingCommentContent={editingCommentContent}
              isCreatingComment={isCreatingComment}
              isUpdatingComment={isUpdatingComment}
              isDeletingComment={isDeletingComment}
              onCommentInputChange={setCommentInput}
              onCreateComment={() => {
                void handleCreateComment();
              }}
              onEditingCommentContentChange={setEditingCommentContent}
              onStartCommentEditing={handleStartCommentEditing}
              onCancelCommentEditing={handleCancelCommentEditing}
              onSaveComment={(commentId) => {
                void handleSaveComment(commentId);
              }}
              onDeleteComment={(commentId) => {
                void handleDeleteComment(commentId);
              }}
            />
          }
        />

        <TicketDetailSidebarCard
          canEditTicket={canEditTicket}
          canDeleteTicket={canDeleteTicket}
          effectiveStatus={effectiveStatus}
          effectivePriority={effectivePriority}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          projectMembers={projectMembers}
          assignees={assignees}
          isUpdatingAssignees={isUpdatingAssignees}
          isSavingMainFields={isSavingMainFields}
          isDeletingTicket={isDeletingTicket}
          canSaveMainFields={canSaveMainFields}
          onStatusChange={setStatusDraft}
          onPriorityChange={setPriorityDraft}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
          onSaveMainFields={() => {
            void handleSaveMainFields();
          }}
          onOpenDeleteModal={() => {
            setIsDeleteModalOpen(true);
          }}
        />
      </div>

      <TicketDetailDeleteModal
        isOpen={isDeleteModalOpen}
        isDeletingTicket={isDeletingTicket}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
        onConfirmDelete={() => {
          void handleDeleteTicket();
        }}
      />
    </section>
  );
};

export default TicketDetailView;
