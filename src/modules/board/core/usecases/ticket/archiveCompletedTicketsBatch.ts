import { WEEKLY_TICKET_ARCHIVE_TIME_ZONE } from "@/modules/board/core/domain/rules/ticketArchival.rules";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

type ArchiveCompletedTicketsBatchOptions = {
  runAt?: Date;
  timeZone?: string;
};

/**
 * Archive completed tickets in batch using the current weekly boundary.
 *
 * The repository is responsible for applying the actual week cutoff and for
 * checking that tickets are still in a done workflow state at archive time.
 */
export const archiveCompletedTicketsBatch = async (
  repository: TicketRepository,
  options: ArchiveCompletedTicketsBatchOptions = {}
): Promise<number> => {
  return repository.archiveCompletedTicketsBatch({
    runAt: options.runAt ?? new Date(),
    timeZone: options.timeZone ?? WEEKLY_TICKET_ARCHIVE_TIME_ZONE,
  });
};
