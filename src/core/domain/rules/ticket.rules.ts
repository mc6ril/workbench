import type {
  CreateTicketInput,
  Ticket,
} from "@/core/domain/schema/ticket.schema";

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
 * Validates ticket parent relationships.
 * Prevents circular references (ticket cannot be its own parent).
 * If allTickets is provided, also prevents multi-level nesting (parent's parent must be null).
 * If allTickets is absent, only validates self-parent check (skips multi-level validation).
 *
 * @param ticket - Ticket to validate (can be Ticket or CreateTicketInput)
 * @param allTickets - Optional array of all tickets for multi-level validation
 * @returns Validation result
 */
export const validateTicketParent = (
  ticket: Ticket | CreateTicketInput,
  allTickets?: Ticket[]
): ValidationResult => {
  // If no parent, validation passes
  if (!ticket.parentId) {
    return { success: true };
  }

  // Check for self-parent (circular reference)
  if ("id" in ticket && ticket.id === ticket.parentId) {
    return {
      success: false,
      error: {
        code: "INVALID_TICKET_PARENT",
        message: "Ticket cannot be its own parent (circular reference)",
        field: "parentId",
      },
    };
  }

  // Multi-level nesting check (only if allTickets is provided)
  if (allTickets) {
    const parent = allTickets.find((t) => t.id === ticket.parentId);
    if (parent) {
      // If parent has a parent, it's multi-level nesting
      if (parent.parentId !== null) {
        return {
          success: false,
          error: {
            code: "INVALID_TICKET_PARENT_MULTI_LEVEL",
            message:
              "Multi-level nesting not allowed: parent ticket already has a parent",
            field: "parentId",
          },
        };
      }
    }
  }

  return { success: true };
};

/**
 * Validates a ticket with all business rules.
 * Combines parent validation.
 * Returns first error encountered.
 *
 * @param ticket - Ticket to validate (can be Ticket or CreateTicketInput)
 * @param allTickets - Optional array of all tickets for parent relationship validation
 * @returns Validation result
 */
export const validateTicket = (
  ticket: Ticket | CreateTicketInput,
  allTickets?: Ticket[]
): ValidationResult => {
  // Validate parent relationships
  const parentResult = validateTicketParent(ticket, allTickets);
  if (!parentResult.success) {
    return parentResult;
  }

  return { success: true };
};
