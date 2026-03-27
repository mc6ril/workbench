import { readFileSync } from "node:fs";
import { join } from "node:path";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/000046_due_date_calendar_date.sql"
);

const normalizedSql = readFileSync(migrationPath, "utf8")
  .replace(/\s+/g, " ")
  .trim();

describe("000046_due_date_calendar_date.sql", () => {
  it("converts due_date to a timezone-safe calendar date", () => {
    expect(normalizedSql).toContain(
      "ALTER TABLE tickets ALTER COLUMN due_date TYPE date USING (due_date::date)"
    );
  });

  it("recreates the due_date index for ordering/filtering", () => {
    expect(normalizedSql).toContain("DROP INDEX IF EXISTS idx_tickets_due_date");
    expect(normalizedSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_tickets_due_date ON tickets(project_id, due_date)"
    );
  });
});

