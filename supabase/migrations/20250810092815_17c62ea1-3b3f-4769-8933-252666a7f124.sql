-- Grant execute permissions on audit-related functions to client roles
GRANT EXECUTE ON FUNCTION public.get_admin_audit_logs(
  uuid,
  text,
  text,
  timestamp without time zone,
  timestamp without time zone,
  integer,
  integer
) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.log_admin_action(
  uuid,
  text,
  text,
  uuid,
  jsonb
) TO anon, authenticated;