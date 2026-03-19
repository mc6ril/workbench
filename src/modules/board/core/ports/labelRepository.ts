import type {
  CreateLabelInput,
  Label,
  UpdateLabelInput,
} from "@/modules/board/core/domain/schema/label.schema";

/**
 * Repository contract for Label operations.
 *
 * Labels are project-scoped tags that can be attached to tickets.
 * A label name must be unique within a project.
 */
export type LabelRepository = {
  /**
   * List all labels for a project.
   */
  listByProject(projectId: string): Promise<Label[]>;

  /**
   * Create a new label.
   * @throws ConstraintError if name already exists in project
   */
  create(input: CreateLabelInput): Promise<Label>;

  /**
   * Update an existing label.
   * @throws NotFoundError if label not found
   */
  update(id: string, input: UpdateLabelInput): Promise<Label>;

  /**
   * Delete a label. Removes all ticket associations.
   */
  delete(id: string): Promise<void>;

  /**
   * Get all label IDs for a ticket.
   */
  getTicketLabelIds(ticketId: string): Promise<string[]>;

  /**
   * Add labels to a ticket.
   * Silently ignores already-attached labels.
   */
  addLabelsToTicket(ticketId: string, labelIds: string[]): Promise<void>;

  /**
   * Remove labels from a ticket.
   */
  removeLabelsFromTicket(ticketId: string, labelIds: string[]): Promise<void>;
};
