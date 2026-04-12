import { loadNormalizedMigrationSql } from "./loadMigrationSql";

const normalizedSql = loadNormalizedMigrationSql(
  "000045_simplify_ticket_priority.sql"
);

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

  it("drops the legacy constraint before updating priorities", () => {
    const dropIndex = normalizedSql.indexOf(
      "ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_priority_check"
    );
    const updateIndex = normalizedSql.indexOf("UPDATE tickets SET priority =");

    expect(dropIndex).toBeGreaterThanOrEqual(0);
    expect(updateIndex).toBeGreaterThanOrEqual(0);
    expect(dropIndex).toBeLessThan(updateIndex);
  });
});
