import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/shared/infrastructure/supabase/client-admin";
import { createLoggerFactory } from "@/shared/observability";

import { WEEKLY_TICKET_ARCHIVE_TIME_ZONE } from "@/modules/board/core/domain/rules/ticketArchival.rules";
import { archiveCompletedTicketsBatch } from "@/modules/board/core/usecases/ticket";
import { createTicketRepository } from "@/modules/board/infrastructure/supabase/ticket/TicketRepository.supabase";

const logger = createLoggerFactory().forScope("API.ArchiveCompletedTickets");

export const dynamic = "force-dynamic";

const isAuthorizedCronRequest = (request: NextRequest): boolean => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return true;
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
};

/**
 * GET /api/jobs/archive-completed-tickets
 *
 * Daily cron endpoint. The underlying batch use case is idempotent and only
 * archives tickets completed before the current local week boundary in
 * Europe/Paris while they are still in a done column.
 */
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      { error: "Unauthorized cron request" },
      { status: 401 }
    );
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const ticketRepository = createTicketRepository(adminClient);
    const archivedCount = await archiveCompletedTicketsBatch(ticketRepository);

    return NextResponse.json(
      {
        success: true,
        archivedCount,
        timeZone: WEEKLY_TICKET_ARCHIVE_TIME_ZONE,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Archive completed tickets job failed", { error });

    return NextResponse.json(
      { error: "Weekly ticket archival failed" },
      { status: 500 }
    );
  }
};
