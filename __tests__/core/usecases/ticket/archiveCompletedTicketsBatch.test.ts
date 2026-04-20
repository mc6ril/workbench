import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

import { WEEKLY_TICKET_ARCHIVE_TIME_ZONE } from "@/modules/board/core/domain/rules/ticketArchival.rules";
import { archiveCompletedTicketsBatch } from "@/modules/board/core/usecases/ticket/archiveCompletedTicketsBatch";

describe("archiveCompletedTicketsBatch", () => {
  it("uses the default archival timezone", async () => {
    const runAt = new Date("2026-03-30T00:05:00.000Z");
    const repository = createTicketRepositoryMock({
      archiveCompletedTicketsBatch: jest.fn<
        Promise<number>,
        [{ runAt: Date; timeZone: string }]
      >(async () => 3),
    });

    const result = await archiveCompletedTicketsBatch(repository, { runAt });

    expect(repository.archiveCompletedTicketsBatch).toHaveBeenCalledWith({
      runAt,
      timeZone: WEEKLY_TICKET_ARCHIVE_TIME_ZONE,
    });
    expect(result).toBe(3);
  });

  it("allows overriding the archival timezone", async () => {
    const runAt = new Date("2026-03-30T00:05:00.000Z");
    const repository = createTicketRepositoryMock({
      archiveCompletedTicketsBatch: jest.fn<
        Promise<number>,
        [{ runAt: Date; timeZone: string }]
      >(async () => 1),
    });

    const result = await archiveCompletedTicketsBatch(repository, {
      runAt,
      timeZone: "UTC",
    });

    expect(repository.archiveCompletedTicketsBatch).toHaveBeenCalledWith({
      runAt,
      timeZone: "UTC",
    });
    expect(result).toBe(1);
  });
});
