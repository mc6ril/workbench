import {
  calculateEpicProgress,
  validateEpicTicketAssignment,
  validateEpicWithTickets,
} from "@/core/domain/rules/epic.rules";
import type { CreateEpicInput, Epic } from "@/core/domain/schema/epic.schema";
import type { Ticket } from "@/core/domain/schema/ticket.schema";

describe("Epic Business Rules", () => {
  const createMockEpic = (overrides?: Partial<Epic>): Epic => ({
    id: "epic-1",
    projectId: "project-1",
    name: "Test Epic",
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

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

  describe("validateEpicTicketAssignment", () => {
    it("should return success when ticket and epic belong to same project", () => {
      // Arrange
      const ticket = createMockTicket({ projectId: "project-1" });
      const epic = createMockEpic({ projectId: "project-1" });

      // Act
      const result = validateEpicTicketAssignment(ticket, epic);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return error when ticket and epic belong to different projects", () => {
      // Arrange
      const ticket = createMockTicket({ projectId: "project-1" });
      const epic = createMockEpic({ projectId: "project-2" });

      // Act
      const result = validateEpicTicketAssignment(ticket, epic);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("TICKET_PROJECT_MISMATCH");
        expect(result.error.field).toBe("projectId");
      }
    });

    it("should return success when ticket has no epic assignment", () => {
      // Arrange
      const ticket = createMockTicket({ epicId: null });
      const epic = createMockEpic();

      // Act
      const result = validateEpicTicketAssignment(ticket, epic);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return success when ticket is already assigned to this epic", () => {
      // Arrange
      const ticket = createMockTicket({ epicId: "epic-1" });
      const epic = createMockEpic({ id: "epic-1" });

      // Act
      const result = validateEpicTicketAssignment(ticket, epic);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return error when ticket is assigned to another epic", () => {
      // Arrange
      const ticket = createMockTicket({ epicId: "epic-2" });
      const epic = createMockEpic({ id: "epic-1" });

      // Act
      const result = validateEpicTicketAssignment(ticket, epic);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("DUPLICATE_EPIC_ASSIGNMENT");
        expect(result.error.field).toBe("epicId");
      }
    });
  });

  describe("calculateEpicProgress", () => {
    it("should return 0 for empty tickets array", () => {
      // Arrange
      const tickets: Ticket[] = [];

      // Act
      const result = calculateEpicProgress(tickets);

      // Assert
      expect(result).toBe(0);
    });

    it("should return 0 when no tickets are completed", () => {
      // Arrange
      const tickets: Ticket[] = [
        createMockTicket({ status: "todo" }),
        createMockTicket({ status: "in-progress" }),
      ];

      // Act
      const result = calculateEpicProgress(tickets);

      // Assert
      expect(result).toBe(0);
    });

    it("should return 100 when all tickets are completed", () => {
      // Arrange
      const tickets: Ticket[] = [
        createMockTicket({ status: "completed" }),
        createMockTicket({ status: "completed" }),
      ];

      // Act
      const result = calculateEpicProgress(tickets);

      // Assert
      expect(result).toBe(100);
    });

    it("should return 50 when half of tickets are completed", () => {
      // Arrange
      const tickets: Ticket[] = [
        createMockTicket({ status: "completed" }),
        createMockTicket({ status: "todo" }),
      ];

      // Act
      const result = calculateEpicProgress(tickets);

      // Assert
      expect(result).toBe(50);
    });

    it("should return 33 when one third of tickets are completed", () => {
      // Arrange
      const tickets: Ticket[] = [
        createMockTicket({ status: "completed" }),
        createMockTicket({ status: "todo" }),
        createMockTicket({ status: "in-progress" }),
      ];

      // Act
      const result = calculateEpicProgress(tickets);

      // Assert
      expect(result).toBe(33);
    });

    it("should round progress correctly", () => {
      // Arrange
      const tickets: Ticket[] = [
        createMockTicket({ status: "completed" }),
        createMockTicket({ status: "todo" }),
        createMockTicket({ status: "todo" }),
      ]; // 1/3 = 33.33... -> 33

      // Act
      const result = calculateEpicProgress(tickets);

      // Assert
      expect(result).toBe(33);
    });
  });

  describe("validateEpicWithTickets", () => {
    it("should return success for valid epic with tickets from same project", () => {
      // Arrange
      const epic = createMockEpic({ id: "epic-1", projectId: "project-1" });
      const tickets: Ticket[] = [
        createMockTicket({
          id: "ticket-1",
          projectId: "project-1",
          epicId: "epic-1",
        }),
        createMockTicket({
          id: "ticket-2",
          projectId: "project-1",
          epicId: "epic-1",
        }),
      ];

      // Act
      const result = validateEpicWithTickets(epic, tickets);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return error when ticket belongs to different project", () => {
      // Arrange
      const epic = createMockEpic({ id: "epic-1", projectId: "project-1" });
      const tickets: Ticket[] = [
        createMockTicket({
          id: "ticket-1",
          projectId: "project-1",
          epicId: "epic-1",
        }),
        createMockTicket({
          id: "ticket-2",
          projectId: "project-2",
          epicId: null,
        }), // Different project
      ];

      // Act
      const result = validateEpicWithTickets(epic, tickets);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("TICKET_PROJECT_MISMATCH");
      }
    });

    it("should return error when ticket has different epicId", () => {
      // Arrange
      const epic = createMockEpic({ id: "epic-1", projectId: "project-1" });
      const tickets: Ticket[] = [
        createMockTicket({
          id: "ticket-1",
          projectId: "project-1",
          epicId: "epic-1",
        }),
        createMockTicket({
          id: "ticket-2",
          projectId: "project-1",
          epicId: "epic-2",
        }), // Different epic
      ];

      // Act
      const result = validateEpicWithTickets(epic, tickets);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        // The error code depends on the order of checks in validateEpicWithTickets
        // It checks consistency first, then duplicate assignment
        expect([
          "INVALID_EPIC_TICKET_CONSISTENCY",
          "DUPLICATE_EPIC_ASSIGNMENT",
        ]).toContain(result.error.code);
      }
    });

    it("should return success for CreateEpicInput (no epicId consistency check)", () => {
      // Arrange
      const epicInput: CreateEpicInput = {
        projectId: "project-1",
        name: "Test Epic",
      };
      const tickets: Ticket[] = [
        createMockTicket({ projectId: "project-1", epicId: null }),
        createMockTicket({ projectId: "project-1", epicId: null }),
      ];

      // Act
      const result = validateEpicWithTickets(epicInput, tickets);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return success for empty tickets array", () => {
      // Arrange
      const epic = createMockEpic();
      const tickets: Ticket[] = [];

      // Act
      const result = validateEpicWithTickets(epic, tickets);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
