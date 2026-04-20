import { loadNormalizedMigrationSql } from "./loadMigrationSql";

const normalizedSql = loadNormalizedMigrationSql(
  "000063_optimize_get_project_ticket_assignees_with_project_id.sql"
);

describe("000063_optimize_get_project_ticket_assignees_with_project_id.sql", () => {
  it("keeps the rpc invoker-safe and stable for RLS-aware reads", () => {
    expect(normalizedSql).toContain(
      "LANGUAGE sql SECURITY INVOKER SET search_path = 'public' STABLE"
    );
  });

  it("filters ticket assignees by denormalized project_id before excluding archived tickets", () => {
    expect(normalizedSql).toContain(
      "FROM ticket_assignees ta JOIN tickets t ON t.id = ta.ticket_id JOIN user_profiles up ON up.id = ta.user_id WHERE ta.project_id = p_project_id AND t.archived_at IS NULL ORDER BY ta.assigned_at ASC"
    );
  });
});
