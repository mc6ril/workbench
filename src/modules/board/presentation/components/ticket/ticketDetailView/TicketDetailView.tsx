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
import TicketDetailSubtasksSection from "./components/TicketDetailSubtasksSection";
import styles from "./TicketDetailView.module.scss";
import { buildEpicOptions, buildPriorityOptions } from "./TicketDetailView.utils";

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
    hasEpicsAccess,
    comments,
    subtasks,
    epics,
    labels,
    projectMembers,
    assignees,
    statusOptions,
    assignedLabelIdSet,
    doneStatuses,
    effectiveTitle,
    effectiveDescription,
    effectiveStatus,
    effectivePriority,
    effectiveEpicId,
    commentInput,
    editingCommentId,
    editingCommentContent,
    isSubtaskFormOpen,
    isDeleteModalOpen,
    isCreatingComment,
    isUpdatingComment,
    isDeletingComment,
    isCreatingSubtask,
    isSavingMainFields,
    isDeletingTicket,
    isUpdatingAssignees,
    createSubtaskErrorMessage,
    setTitleDraft,
    setDescriptionDraft,
    setStatusDraft,
    setPriorityDraft,
    setEpicIdDraft,
    setCommentInput,
    setEditingCommentContent,
    setIsSubtaskFormOpen,
    setIsDeleteModalOpen,
    handleSaveMainFields,
    handleToggleLabel,
    handleAssign,
    handleUnassign,
    handleCreateComment,
    handleStartCommentEditing,
    handleCancelCommentEditing,
    handleSaveComment,
    handleDeleteComment,
    handleCreateSubtask,
    handleToggleSubtaskCompleted,
    handleDeleteSubtask,
    handleDeleteTicket,
  } = useTicketDetailController({
    projectId,
    ticketId,
  });

  const priorityOptions = useMemo(() => {
    return buildPriorityOptions(t);
  }, [t]);

  const epicOptions = useMemo(() => {
    return buildEpicOptions(epics, t);
  }, [epics, t]);

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
          hasEpicsAccess={hasEpicsAccess}
          effectiveStatus={effectiveStatus}
          effectivePriority={effectivePriority}
          effectiveEpicId={effectiveEpicId}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          epicOptions={epicOptions}
          labels={labels}
          assignedLabelIdSet={assignedLabelIdSet}
          projectMembers={projectMembers}
          assignees={assignees}
          isUpdatingAssignees={isUpdatingAssignees}
          isSavingMainFields={isSavingMainFields}
          isDeletingTicket={isDeletingTicket}
          canSaveMainFields={canSaveMainFields}
          onStatusChange={setStatusDraft}
          onPriorityChange={setPriorityDraft}
          onEpicChange={setEpicIdDraft}
          onToggleLabel={(labelId) => {
            void handleToggleLabel(labelId);
          }}
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

      <TicketDetailSubtasksSection
        subtasks={subtasks}
        doneStatuses={doneStatuses}
        canEditTicket={canEditTicket}
        canDeleteTicket={canDeleteTicket}
        isSubtaskFormOpen={isSubtaskFormOpen}
        isCreatingSubtask={isCreatingSubtask}
        createSubtaskErrorMessage={createSubtaskErrorMessage}
        onToggleSubtaskCompleted={handleToggleSubtaskCompleted}
        onDeleteSubtask={handleDeleteSubtask}
        onOpenSubtaskForm={() => {
          setIsSubtaskFormOpen(true);
        }}
        onCloseSubtaskForm={() => {
          setIsSubtaskFormOpen(false);
        }}
        onCreateSubtask={(values) => {
          void handleCreateSubtask(values);
        }}
      />

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
