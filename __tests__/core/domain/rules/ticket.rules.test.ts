import {
  validateTicket,
  validateTicketParent,
} from "@/core/domain/rules/ticket.rules";
import type {
  CreateTicketInput,
  Ticket,
} from "@/core/domain/schema/ticket.schema";

describe("Ticket Business Rules", () => {
  const createMockTicket = (overrides?: Partial<Ticket>): Ticket => ({
    id: "ticket-1",
    projectId: "project-1",
    title: "Test Ticket",
    description: null,
    status: "todo",
    position: 0,
    epicId: null,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("validateTicketParent", () => {
    it("should return success when ticket has no parent", () => {
      // Arrange
      const ticket = createMockTicket({ parentId: null });

      // Act
      const result = validateTicketParent(ticket);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return success when ticket has valid parent", () => {
      // Arrange
      const ticket = createMockTicket({ parentId: "parent-1" });

      // Act
      const result = validateTicketParent(ticket);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return error when ticket is its own parent", () => {
      // Arrange
      const ticket = createMockTicket({ id: "ticket-1", parentId: "ticket-1" });

      // Act
      const result = validateTicketParent(ticket);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_TICKET_PARENT");
        expect(result.error.field).toBe("parentId");
      }
    });

    it("should return success for CreateTicketInput with parent (no self-parent check possible)", () => {
      // Arrange
      const ticketInput: CreateTicketInput = {
        projectId: "project-1",
        title: "Test Ticket",
        parentId: "parent-1",
        status: "todo",
        position: 0,
      };

      // Act
      const result = validateTicketParent(ticketInput);

      // Assert
      expect(result.success).toBe(true);
    });

    describe("with allTickets provided", () => {
      it("should return success when parent has no parent (single level)", () => {
        // Arrange
        const parent = createMockTicket({ id: "parent-1", parentId: null });
        const ticket = createMockTicket({ parentId: "parent-1" });
        const allTickets = [parent, ticket];

        // Act
        const result = validateTicketParent(ticket, allTickets);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should return error when parent has a parent (multi-level nesting)", () => {
        // Arrange
        const grandParent = createMockTicket({
          id: "grandparent-1",
          parentId: null,
        });
        const parent = createMockTicket({
          id: "parent-1",
          parentId: "grandparent-1",
        });
        const ticket = createMockTicket({ parentId: "parent-1" });
        const allTickets = [grandParent, parent, ticket];

        // Act
        const result = validateTicketParent(ticket, allTickets);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe("INVALID_TICKET_PARENT_MULTI_LEVEL");
          expect(result.error.field).toBe("parentId");
        }
      });

      it("should return success when parent not found in allTickets", () => {
        // Arrange
        const ticket = createMockTicket({ parentId: "parent-1" });
        const allTickets: Ticket[] = [ticket]; // Parent not in list

        // Act
        const result = validateTicketParent(ticket, allTickets);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    describe("without allTickets", () => {
      it("should skip multi-level validation when allTickets not provided", () => {
        // Arrange
        const ticket = createMockTicket({ parentId: "parent-1" });

        // Act
        const result = validateTicketParent(ticket);

        // Assert
        // Should pass (only checks self-parent, which doesn't apply here)
        expect(result.success).toBe(true);
      });
    });
  });

  describe("validateTicket", () => {
    it("should return success for valid ticket without parent", () => {
      // Arrange
      const ticket = createMockTicket({ parentId: null });

      // Act
      const result = validateTicket(ticket);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return success for valid ticket with parent", () => {
      // Arrange
      const parent = createMockTicket({ id: "parent-1", parentId: null });
      const ticket = createMockTicket({ parentId: "parent-1" });
      const allTickets = [parent, ticket];

      // Act
      const result = validateTicket(ticket, allTickets);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return error for circular reference", () => {
      // Arrange
      const ticket = createMockTicket({ id: "ticket-1", parentId: "ticket-1" });

      // Act
      const result = validateTicket(ticket);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_TICKET_PARENT");
      }
    });

    it("should return error for multi-level nesting", () => {
      // Arrange
      const grandParent = createMockTicket({
        id: "grandparent-1",
        parentId: null,
      });
      const parent = createMockTicket({
        id: "parent-1",
        parentId: "grandparent-1",
      });
      const ticket = createMockTicket({ parentId: "parent-1" });
      const allTickets = [grandParent, parent, ticket];

      // Act
      const result = validateTicket(ticket, allTickets);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_TICKET_PARENT_MULTI_LEVEL");
      }
    });

    it("should work with CreateTicketInput", () => {
      // Arrange
      const ticketInput: CreateTicketInput = {
        projectId: "project-1",
        title: "Test Ticket",
        status: "todo",
        position: 0,
        parentId: "parent-1",
      };
      const parent = createMockTicket({ id: "parent-1", parentId: null });
      const allTickets = [parent];

      // Act
      const result = validateTicket(ticketInput, allTickets);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
