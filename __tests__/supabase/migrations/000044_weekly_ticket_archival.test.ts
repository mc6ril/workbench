import { loadNormalizedMigrationSql } from "./loadMigrationSql";

import { WEEKLY_TICKET_ARCHIVE_TIME_ZONE } from "@/modules/board/core/domain/rules/ticketArchival.rules";

const normalizedSql = loadNormalizedMigrationSql(
  "000044_weekly_ticket_archival.sql"
);

describe("000044_weekly_ticket_archival.sql", () => {
  it("uses the configured timezone and the current local week boundary", () => {
    expect(normalizedSql).toContain(
      `p_time_zone text DEFAULT '${WEEKLY_TICKET_ARCHIVE_TIME_ZONE}'`
    );
    expect(normalizedSql).toContain(
      "current_week_start_local := date_trunc('week', p_now AT TIME ZONE p_time_zone);"
    );
    expect(normalizedSql).toContain(
      "completed_before := current_week_start_local AT TIME ZONE p_time_zone;"
    );
  });

  it("archives only completed tickets that are still in a done workflow column", () => {
    expect(normalizedSql).toContain("WHERE t.completed_at IS NOT NULL");
    expect(normalizedSql).toContain("AND t.archived_at IS NULL");
    expect(normalizedSql).toContain("AND t.completed_at < completed_before");
    expect(normalizedSql).toContain("AND EXISTS (");
    expect(normalizedSql).toContain("FROM boards b JOIN columns c");
    expect(normalizedSql).toContain("AND c.state = 'done'");
  });

  it("stores archival metadata for historical lookup", () => {
    expect(normalizedSql).toContain("archived_at = p_now");
    expect(normalizedSql).toContain("archived_week_start = date_trunc(");
  });
});
