import { readFileSync } from "node:fs";
import { join } from "node:path";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/000045_simplify_ticket_priority.sql"
);

const normalizedSql = readFileSync(migrationPath, "utf8")
  .replace(/\s+/g, " ")
  .trim();

describe("000045_simplify_ticket_priority.sql", () => {
  it("remaps legacy priority values to the simplified set", () => {
    expect(normalizedSql).toContain(
      "WHEN priority IN ('highest', 'high') THEN 'urgent'"
    );
    expect(normalizedSql).toContain("WHEN priority = 'medium' THEN 'normal'");
    expect(normalizedSql).toContain(
      "WHEN priority IN ('low', 'lowest') THEN 'low'"
    );
  });

  it("replaces the priority check constraint with the simplified values", () => {
    expect(normalizedSql).toContain(
      "DROP CONSTRAINT IF EXISTS tickets_priority_check"
    );
    expect(normalizedSql).toContain(
      "CHECK (priority IS NULL OR priority IN ('urgent', 'normal', 'low'))"
    );
  });
});
