import { loadNormalizedMigrationSql } from "./loadMigrationSql";

const normalizedSql = loadNormalizedMigrationSql(
  "000062_refine_rls_with_denormalized_project_id.sql"
);

describe("000062_refine_rls_with_denormalized_project_id.sql", () => {
  it("uses comments.project_id for project-scoped read and delete policies", () => {
    expect(normalizedSql).toContain(
      'CREATE POLICY "Project members can view comments" ON public.comments FOR SELECT TO authenticated USING (is_project_member(project_id))'
    );
    expect(normalizedSql).toContain(
      'CREATE POLICY "Authors and admins can delete comments" ON public.comments FOR DELETE TO authenticated USING ( author_id = auth.uid() OR is_project_admin(project_id) )'
    );
  });

  it("uses ticket_assignees.project_id for project-scoped read and delete policies", () => {
    expect(normalizedSql).toContain(
      'CREATE POLICY "Project members can view ticket assignees" ON public.ticket_assignees FOR SELECT TO authenticated USING (is_project_member(project_id))'
    );
    expect(normalizedSql).toContain(
      'CREATE POLICY "Project editors can delete ticket assignees" ON public.ticket_assignees FOR DELETE TO authenticated USING (can_edit_project(project_id))'
    );
  });
});
