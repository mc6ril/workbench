import type { ProjectWithRole } from "@/core/domain/schema/project.schema";
import type { Ticket, TicketFilters, TicketSort } from "@/core/domain/schema/ticket.schema";

import { listProjects } from "@/core/usecases/project/listProjects";
import { listTickets } from "@/core/usecases/ticket/listTickets";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createProjectRepositoryMock } from "../../../../__mocks__/core/ports/projectRepository";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

describe("Ticket Flow Tests", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  const mockProjectWithRole: ProjectWithRole = {
    id: projectId,
    name: "Test Project",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    role: "admin",
  };

  const mockTicket1: Ticket = {
    id: "223e4567-e89b-12d3-a456-426614174000",
    projectId,
    title: "Ticket 1",
    description: "First ticket description",
    status: "todo",
    position: 0,
    epicId: null,
    parentId: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockTicket2: Ticket = {
    id: "323e4567-e89b-12d3-a456-426614174001",
    projectId,
    title: "Ticket 2",
    description: "Second ticket description",
    status: "in-progress",
    position: 1,
    epicId: null,
    parentId: null,
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  describe("complete ticket flow: listProjects → listTickets", () => {
    it("should complete ticket flow successfully", async () => {
      // Arrange
      const projects: ProjectWithRole[] = [mockProjectWithRole];
      const tickets: Ticket[] = [mockTicket1, mockTicket2];
      const projectRepository = createProjectRepositoryMock({
        list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => projects),
      });
      const ticketRepository = createTicketRepositoryMock({
        listByProject: jest.fn<Promise<Ticket[]>, [string, TicketFilters?, TicketSort?]>(
          async () => tickets
        ),
      });

      // Act - Step 1: List projects
      const projectsResult = await listProjects(projectRepository);

      // Assert - Step 1: Projects should be listed
      expect(projectRepository.list).toHaveBeenCalledTimes(1);
      expect(projectRepository.list).toHaveBeenCalledWith();
      expect(projectsResult).toEqual(projects);
      expect(projectsResult).toHaveLength(1);
      expect(projectsResult[0].id).toBe(projectId);

      // Act - Step 2: List tickets for the project
      const ticketsResult = await listTickets(ticketRepository, projectId);

      // Assert - Step 2: Tickets should be listed
      expect(ticketRepository.listByProject).toHaveBeenCalledTimes(1);
      expect(ticketRepository.listByProject).toHaveBeenCalledWith(
        projectId,
        undefined,
        undefined
      );
      expect(ticketsResult).toEqual(tickets);
      expect(ticketsResult).toHaveLength(2);
      expect(ticketsResult[0].title).toBe("Ticket 1");
      expect(ticketsResult[1].title).toBe("Ticket 2");
    });

    it("should handle empty tickets list", async () => {
      // Arrange
      const projects: ProjectWithRole[] = [mockProjectWithRole];
      const projectRepository = createProjectRepositoryMock({
        list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => projects),
      });
      const ticketRepository = createTicketRepositoryMock({
        listByProject: jest.fn<Promise<Ticket[]>, [string, TicketFilters?, TicketSort?]>(
          async () => []
        ),
      });

      // Act - Step 1: List projects
      const projectsResult = await listProjects(projectRepository);
      expect(projectsResult).toHaveLength(1);

      // Act - Step 2: List tickets (should return empty array)
      const ticketsResult = await listTickets(ticketRepository, projectId);

      // Assert - Step 2: Tickets should be empty
      expect(ticketRepository.listByProject).toHaveBeenCalledTimes(1);
      expect(ticketRepository.listByProject).toHaveBeenCalledWith(
        projectId,
        undefined,
        undefined
      );
      expect(ticketsResult).toEqual([]);
      expect(ticketsResult).toHaveLength(0);
    });

    it("should handle error when listing projects fails", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      const projectRepository = createProjectRepositoryMock({
        list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => {
          throw repositoryError;
        }),
      });
      const ticketRepository = createTicketRepositoryMock({
        listByProject: jest.fn<Promise<Ticket[]>, [string, TicketFilters?, TicketSort?]>(
          async () => []
        ),
      });

      // Act & Assert - Step 1: List projects (should fail)
      await expect(listProjects(projectRepository)).rejects.toThrow(
        repositoryError
      );

      // Note: In a real flow, listTickets wouldn't be called if listProjects fails,
      // but we verify it was not called
      expect(ticketRepository.listByProject).not.toHaveBeenCalled();
    });

    it("should handle error when listing tickets fails", async () => {
      // Arrange
      const projects: ProjectWithRole[] = [mockProjectWithRole];
      const repositoryError = new Error("Database connection failed");
      const projectRepository = createProjectRepositoryMock({
        list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => projects),
      });
      const ticketRepository = createTicketRepositoryMock({
        listByProject: jest.fn<Promise<Ticket[]>, [string, TicketFilters?, TicketSort?]>(
          async () => {
            throw repositoryError;
          }
        ),
      });

      // Act - Step 1: List projects (should succeed)
      const projectsResult = await listProjects(projectRepository);
      expect(projectsResult).toHaveLength(1);

      // Act & Assert - Step 2: List tickets (should fail)
      await expect(listTickets(ticketRepository, projectId)).rejects.toThrow(
        repositoryError
      );
      expect(ticketRepository.listByProject).toHaveBeenCalledTimes(1);
      expect(ticketRepository.listByProject).toHaveBeenCalledWith(
        projectId,
        undefined,
        undefined
      );
    });

    it("should use correct projectId from listProjects result when listing tickets", async () => {
      // Arrange
      const differentProjectId = "456e7890-e89b-12d3-a456-426614174001";
      const differentProject: ProjectWithRole = {
        id: differentProjectId,
        name: "Different Project",
        createdAt: new Date("2024-01-02T00:00:00Z"),
        updatedAt: new Date("2024-01-02T00:00:00Z"),
        role: "member",
      };
      const projects: ProjectWithRole[] = [differentProject];
      const tickets: Ticket[] = [mockTicket1];
      const projectRepository = createProjectRepositoryMock({
        list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => projects),
      });
      const ticketRepository = createTicketRepositoryMock({
        listByProject: jest.fn<Promise<Ticket[]>, [string, TicketFilters?, TicketSort?]>(
          async () => tickets
        ),
      });

      // Act - Step 1: List projects
      const projectsResult = await listProjects(projectRepository);
      const firstProjectId = projectsResult[0]?.id;

      // Act - Step 2: List tickets for the first project
      const ticketsResult = await listTickets(
        ticketRepository,
        firstProjectId!
      );

      // Assert - Step 2: Tickets should be listed with correct projectId
      expect(ticketRepository.listByProject).toHaveBeenCalledTimes(1);
      expect(ticketRepository.listByProject).toHaveBeenCalledWith(
        differentProjectId,
        undefined,
        undefined
      );
      expect(ticketsResult).toEqual(tickets);
    });
  });
});
