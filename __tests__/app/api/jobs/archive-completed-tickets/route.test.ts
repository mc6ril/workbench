import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

jest.mock("@/shared/infrastructure/supabase/client-admin", () => ({
  createSupabaseAdminClient: jest.fn(),
}));

jest.mock(
  "@/modules/board/infrastructure/supabase/ticket/TicketRepository.supabase",
  () => ({
    createTicketRepository: jest.fn(),
  })
);

jest.mock("@/modules/board/core/usecases/ticket", () => ({
  archiveCompletedTicketsBatch: jest.fn(),
}));

jest.mock("@/shared/observability", () => ({
  createLoggerFactory: () => ({
    forScope: () => ({
      error: jest.fn(),
      warn: jest.fn(),
    }),
  }),
}));

import { createSupabaseAdminClient } from "@/shared/infrastructure/supabase/client-admin";

import {
  GET,
  POST,
} from "@/app/api/jobs/archive-completed-tickets/route";
import { WEEKLY_TICKET_ARCHIVE_TIME_ZONE } from "@/modules/board/core/domain/rules/ticketArchival.rules";
import { archiveCompletedTicketsBatch } from "@/modules/board/core/usecases/ticket";
import { createTicketRepository } from "@/modules/board/infrastructure/supabase/ticket/TicketRepository.supabase";

type MockNextResponse = {
  status: number;
  json: () => Promise<unknown>;
};

const createRequest = (authorization?: string): NextRequest =>
  ({
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "authorization" ? (authorization ?? null) : null,
    },
  }) as NextRequest;

describe("GET /api/jobs/archive-completed-tickets", () => {
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.CRON_SECRET;
  });

  afterAll(() => {
    if (originalCronSecret === undefined) {
      delete process.env.CRON_SECRET;
      return;
    }

    process.env.CRON_SECRET = originalCronSecret;
  });

  it("rejects execution when CRON_SECRET is missing", async () => {
    const response = (await GET(createRequest())) as MockNextResponse;

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Cron secret is not configured",
    });
  });

  it("rejects unauthorized cron requests when CRON_SECRET is configured", async () => {
    process.env.CRON_SECRET = "super-secret";

    const response = (await GET(createRequest())) as MockNextResponse;

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized cron request",
    });
  });

  it("runs the batch archival job and returns the archived count", async () => {
    process.env.CRON_SECRET = "super-secret";

    jest
      .mocked(createSupabaseAdminClient)
      .mockReturnValue({} as ReturnType<typeof createSupabaseAdminClient>);
    jest
      .mocked(createTicketRepository)
      .mockReturnValue({} as ReturnType<typeof createTicketRepository>);
    jest.mocked(archiveCompletedTicketsBatch).mockResolvedValue(4);

    const response = (await GET(
      createRequest("Bearer super-secret")
    )) as MockNextResponse;

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      archivedCount: 4,
      timeZone: WEEKLY_TICKET_ARCHIVE_TIME_ZONE,
    });
    expect(archiveCompletedTicketsBatch).toHaveBeenCalledTimes(1);
  });

  it("allows secure manual POST execution with the cron bearer secret", async () => {
    process.env.CRON_SECRET = "super-secret";

    jest
      .mocked(createSupabaseAdminClient)
      .mockReturnValue({} as ReturnType<typeof createSupabaseAdminClient>);
    jest
      .mocked(createTicketRepository)
      .mockReturnValue({} as ReturnType<typeof createTicketRepository>);
    jest.mocked(archiveCompletedTicketsBatch).mockResolvedValue(2);

    const response = (await POST(
      createRequest("Bearer super-secret")
    )) as MockNextResponse;

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      archivedCount: 2,
      timeZone: WEEKLY_TICKET_ARCHIVE_TIME_ZONE,
    });
  });
});
