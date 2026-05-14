import { mapTicketRowToDomain } from "@/modules/board/infrastructure/supabase/ticket/TicketMapper.supabase";
import type { TicketRow } from "@/modules/board/infrastructure/supabase/ticket/types";

describe("TicketMapper.supabase", () => {
  const baseRow: TicketRow = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    project_id: "223e4567-e89b-12d3-a456-426614174000",
    title: "Refactor archiving model",
    description: null,
    column_id: "323e4567-e89b-12d3-a456-426614174000",
    position: 0,
    code_number: 1,
    priority: null,
    due_date: null,
    story_points: null,
    created_by: null,
    completed_at: null,
    archived_at: null,
    archived_week_start: null,
    created_at: "2026-03-20T09:00:00.000Z",
    updated_at: "2026-03-20T09:00:00.000Z",
    checklist: [],
  };

  it("maps archival metadata from Supabase rows", () => {
    const result = mapTicketRowToDomain({
      ...baseRow,
      completed_at: "2026-03-21T10:00:00.000Z",
      archived_at: "2026-03-24T08:30:00.000Z",
      archived_week_start: "2026-03-24",
    });

    expect(result.completedAt).toEqual(new Date("2026-03-21T10:00:00.000Z"));
    expect(result.archivedAt).toEqual(new Date("2026-03-24T08:30:00.000Z"));
    expect(result.archivedWeekStart).toEqual(new Date("2026-03-24"));
    expect(result.columnId).toBe(baseRow.column_id);
  });

  it("keeps archival metadata nullable", () => {
    const result = mapTicketRowToDomain(baseRow);

    expect(result.completedAt).toBeNull();
    expect(result.archivedAt).toBeNull();
    expect(result.archivedWeekStart).toBeNull();
  });
});
