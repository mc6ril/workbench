import { readFileSync } from "node:fs";
import { join } from "node:path";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/000047_remove_legacy_epics_labels_subtasks.sql"
);

const normalizedSql = readFileSync(migrationPath, "utf8")
  .replace(/\s+/g, " ")
  .trim();

describe("000047_remove_legacy_epics_labels_subtasks.sql", () => {
  it("removes legacy realtime tables before dropping schema objects", () => {
    expect(normalizedSql).toContain(
      "realtime_tables text[] := ARRAY[ 'ticket_labels', 'labels', 'epics' ]"
    );
    expect(normalizedSql).toContain(
      "ALTER PUBLICATION supabase_realtime DROP TABLE public.%I"
    );
  });

  it("drops legacy epic, label, and subtask schema objects", () => {
    expect(normalizedSql).toContain(
      "DROP FUNCTION IF EXISTS public.allocate_epic_code_number(uuid)"
    );
    expect(normalizedSql).toContain(
      "DROP INDEX IF EXISTS public.idx_tickets_project_epic"
    );
    expect(normalizedSql).toContain(
      "DROP INDEX IF EXISTS public.idx_tickets_epic_id"
    );
    expect(normalizedSql).toContain(
      "DROP INDEX IF EXISTS public.idx_tickets_parent_id"
    );
    expect(normalizedSql).toContain(
      "ALTER TABLE IF EXISTS public.tickets DROP CONSTRAINT IF EXISTS fk_tickets_epic, DROP CONSTRAINT IF EXISTS fk_tickets_parent"
    );
    expect(normalizedSql).toContain(
      "ALTER TABLE IF EXISTS public.tickets DROP COLUMN IF EXISTS epic_id, DROP COLUMN IF EXISTS parent_id"
    );
    expect(normalizedSql).toContain(
      "DROP TABLE IF EXISTS public.ticket_labels"
    );
    expect(normalizedSql).toContain("DROP TABLE IF EXISTS public.labels");
    expect(normalizedSql).toContain("DROP TABLE IF EXISTS public.epics");
  });

  it("redefines project stats without subtask filtering", () => {
    expect(normalizedSql).toContain(
      "CREATE OR REPLACE FUNCTION public.get_projects_with_stats()"
    );
    expect(normalizedSql).toContain("SET search_path = ''");
    expect(normalizedSql).not.toContain("parent_id IS NULL");
  });
});
