import { loadNormalizedMigrationSql } from "./loadMigrationSql";

const normalizedSql = loadNormalizedMigrationSql(
  "000061_recipe_covers_storage.sql"
);

describe("000061_recipe_covers_storage.sql", () => {
  it("creates the public recipe covers bucket with the expected limits", () => {
    expect(normalizedSql).toContain(
      "INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES ( 'recipe-covers', 'recipe-covers', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[] )"
    );
    expect(normalizedSql).toContain(
      "ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types"
    );
  });

  it("creates public read access and authenticated write access scoped to the user folder", () => {
    expect(normalizedSql).toContain(
      "CREATE POLICY \"recipe_covers_bucket_public_read\" ON storage.objects FOR SELECT TO public USING (bucket_id = 'recipe-covers')"
    );
    expect(normalizedSql).toContain(
      "CREATE POLICY \"recipe_covers_bucket_authenticated_insert_own_folder\" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'recipe-covers' AND (storage.foldername(name))[1] = (auth.uid())::text )"
    );
    expect(normalizedSql).toContain(
      "CREATE POLICY \"recipe_covers_bucket_authenticated_update_own_folder\" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'recipe-covers' AND (storage.foldername(name))[1] = (auth.uid())::text ) WITH CHECK ( bucket_id = 'recipe-covers' AND (storage.foldername(name))[1] = (auth.uid())::text )"
    );
    expect(normalizedSql).toContain(
      "CREATE POLICY \"recipe_covers_bucket_authenticated_delete_own_folder\" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'recipe-covers' AND (storage.foldername(name))[1] = (auth.uid())::text )"
    );
  });
});
