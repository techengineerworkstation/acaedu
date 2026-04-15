-- Check users table structure and permissions
SELECT
  c.relname as table_name,
  a.rolname as table_owner,
  has_table_privilege(a.rolname, 'SELECT') as owner_select,
  has_table_privilege(current_user, 'users', 'SELECT') as current_user_select
FROM pg_class c
JOIN pg_roles a ON c.relowner = a.oid
WHERE c.relname = 'users';

-- Check what user the connection is using
SELECT current_user;

-- Check if RLS is enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'users';

-- Check grants on users table
SELECT
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'users'
ORDER BY grantee, privilege_type;
