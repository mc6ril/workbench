import { createTicketRepositoryMock, type TicketRepositoryMock } from "./repositoryMocks";

describe("repository mocks", () => {
  it("creates a ticket repository mock with jest.fn methods by default", async () => {
    const repo = createTicketRepositoryMock();

    expect(typeof repo.listTickets).toBe("function");
    expect(typeof repo.getTicketById).toBe("function");

    await repo.listTickets();
    await repo.getTicketById("id-1");

    expect(repo.listTickets).toHaveBeenCalledTimes(1);
    expect(repo.getTicketById).toHaveBeenCalledWith("id-1");
  });

  it("allows overriding individual methods", async () => {
    const listTickets = jest.fn<Promise<unknown[]>, []>(async () => [{ id: "1" }]);

    const repo: TicketRepositoryMock = createTicketRepositoryMock({ listTickets });

    const result = await repo.listTickets();

    expect(listTickets).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: "1" }]);
  });
});
