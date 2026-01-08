import type { CreateEpicInput, Epic } from "@/core/domain/schema/epic.schema";
import type { Ticket } from "@/core/domain/schema/ticket.schema";

/**
 * Status that indicates a ticket is completed.
 * Used for progress calculation.
 */
const COMPLETED_STATUS = "completed";

/**
 * Validation result type for business rules.
 * Returns success or error with code and message.
 */
type ValidationResult =
  | { success: true }
  | { success: false; error: ValidationError };

type ValidationError = {
  code: string;
  message: string;
  field?: string;
};

/**
 * Validates ticket assignment to an epic.
 * Ensures ticket belongs to same project as epic.
 * Prevents duplicate ticket assignments (ticket already assigned to another epic).
 *
 * @param ticket - Ticket to validate
 * @param epic - Epic to assign ticket to
 * @returns Validation result
 */
export const validateEpicTicketAssignment = (
  ticket: Ticket,
  epic: Epic
): ValidationResult => {
  // Check project match
  if (ticket.projectId !== epic.projectId) {
    return {
      success: false,
      error: {
        code: "TICKET_PROJECT_MISMATCH",
        message: `Ticket belongs to project ${ticket.projectId}, but epic belongs to project ${epic.projectId}`,
        field: "projectId",
      },
    };
  }

  // Check if ticket is already assigned to another epic
  if (ticket.epicId !== null && ticket.epicId !== epic.id) {
    return {
      success: false,
      error: {
        code: "DUPLICATE_EPIC_ASSIGNMENT",
        message: `Ticket is already assigned to epic ${ticket.epicId}, cannot assign to epic ${epic.id}`,
        field: "epicId",
      },
    };
  }

  return { success: true };
};

/**
 * Calculates epic progress based on ticket statuses.
 * Pure calculation function (no validation, just calculation).
 * Returns percentage (0-100) of tickets with completed status.
 *
 * @param tickets - Array of tickets assigned to epic
 * @returns Progress percentage (0-100)
 */
export const calculateEpicProgress = (tickets: Ticket[]): number => {
  if (tickets.length === 0) {
    return 0;
  }

  const completedCount = tickets.filter(
    (ticket) => ticket.status === COMPLETED_STATUS
  ).length;

  return Math.round((completedCount / tickets.length) * 100);
};

/**
 * Validates an epic with all its ticket assignments.
 * Combines ticket assignment validation.
 * Validates all tickets belong to same project as epic.
 * Optionally validates all tickets have epicId matching epic.id (consistency check).
 *
 * @param epic - Epic to validate (can be Epic or CreateEpicInput)
 * @param tickets - Array of tickets assigned to epic
 * @returns Validation result
 */
export const validateEpicWithTickets = (
  epic: Epic | CreateEpicInput,
  tickets: Ticket[]
): ValidationResult => {
  // Get epic ID: use epic.id if available, otherwise skip consistency check
  const epicId = "id" in epic ? epic.id : undefined;

  // Validate each ticket assignment
  for (const ticket of tickets) {
    // Check project match
    if (ticket.projectId !== epic.projectId) {
      return {
        success: false,
        error: {
          code: "TICKET_PROJECT_MISMATCH",
          message: `Ticket ${ticket.id} belongs to project ${ticket.projectId}, but epic belongs to project ${epic.projectId}`,
          field: "projectId",
        },
      };
    }

    // Check consistency: if epicId is available, verify ticket has matching epicId
    if (epicId && ticket.epicId !== epicId) {
      return {
        success: false,
        error: {
          code: "INVALID_EPIC_TICKET_CONSISTENCY",
          message: `Ticket ${ticket.id} has epicId ${ticket.epicId}, but expected epicId ${epicId}`,
          field: "epicId",
        },
      };
    }

    // Check if ticket is assigned to another epic
    if (ticket.epicId !== null && epicId && ticket.epicId !== epicId) {
      return {
        success: false,
        error: {
          code: "DUPLICATE_EPIC_ASSIGNMENT",
          message: `Ticket ${ticket.id} is already assigned to epic ${ticket.epicId}, cannot assign to epic ${epicId}`,
          field: "epicId",
        },
      };
    }
  }

  return { success: true };
};
