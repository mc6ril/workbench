SELECT 
  t.schemaname,
  t.tablename,
  CASE 
    WHEN t.rowsecurity THEN 'ENABLED' 
    ELSE 'DISABLED' 
  END as rls_status,
  p.policyname,
  p.permissive,
  p.roles::text as target_roles,
  p.cmd as command,
  CASE 
    WHEN p.qual IS NOT NULL THEN p.qual 
    ELSE 'N/A' 
  END as using_clause,
  CASE 
    WHEN p.with_check IS NOT NULL THEN p.with_check 
    ELSE 'N/A' 
  END as with_check_clause
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.tablename IN ('projects', 'project_members', 'boards', 'columns', 'epics', 'tickets')
ORDER BY t.tablename, p.policyname;