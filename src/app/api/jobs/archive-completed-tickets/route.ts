import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/shared/infrastructure/supabase/admin";

import { WEEKLY_TICKET_ARCHIVE_TIME_ZONE } from "@/modules/board/core/domain/rules/ticketArchival.rules";
import { archiveCompletedTicketsBatch } from "@/modules/board/core/usecases/ticket/archiveCompletedTicketsBatch";
import { createTicketRepository } from "@/modules/board/infrastructure/supabase/ticket/TicketRepository.supabase";

export const dynamic = "force-dynamic";

const getCronSecret = (): string | null => {
  return process.env.CRON_SECRET?.trim() || null;
};

const isAuthorizedCronRequest = (
  request: NextRequest,
  cronSecret: string
): boolean => {
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
};

const executeArchiveCompletedTickets = async (
  request: NextRequest
): Promise<NextResponse> => {
  const cronSecret = getCronSecret();

  if (!cronSecret) {
    console.error("Archive completed tickets job is misconfigured", {
      reason: "CRON_SECRET is missing",
    });

    return NextResponse.json(
      { error: "Cron secret is not configured" },
      { status: 503 }
    );
  }

  if (!isAuthorizedCronRequest(request, cronSecret)) {
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
    console.error("Archive completed tickets job failed", { error });

    return NextResponse.json(
      { error: "Weekly ticket archival failed" },
      { status: 500 }
    );
  }
};

/**
 * GET /api/jobs/archive-completed-tickets
 *
 * Daily cron endpoint. The underlying batch use case is idempotent and only
 * archives tickets completed before the current local week boundary in
 * Europe/Paris while they are still in a done column.
 *
 * Vercel Cron invokes this route with GET in production. We also support POST
 * with the same bearer secret to allow secure manual triggering when testing.
 */
export const GET = executeArchiveCompletedTickets;

export const POST = executeArchiveCompletedTickets;
