CREATE OR REPLACE FUNCTION public.admin_authorization_log(_days integer DEFAULT 30, _offset integer DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE result jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;
  IF _days NOT IN (7, 30, 90) OR _offset < 0 OR _offset > 100000 THEN
    RAISE EXCEPTION 'Invalid log range';
  END IF;
  WITH events AS (
    SELECT a.id::text AS id, a.created_at AS occurred_at,
      coalesce(a.payload->>'actor_username', '—') AS account,
      a.payload->>'action' AS action, 'audit'::text AS source
    FROM auth.audit_log_entries a
    WHERE a.created_at >= now() - make_interval(days => _days)
      AND a.payload->>'action' IN ('login', 'logout', 'user_signedup', 'user_recovery_requested', 'user_password_updated', 'token_revoked', 'user_repeated_signup')
    UNION ALL
    SELECT 'last-login-' || u.id::text, u.last_sign_in_at, coalesce(u.email, '—'), 'login', 'last_sign_in'
    FROM auth.users u
    WHERE u.last_sign_in_at >= now() - make_interval(days => _days)
      AND NOT EXISTS (SELECT 1 FROM auth.audit_log_entries a WHERE a.payload->>'action' = 'login'
        AND a.payload->>'actor_id' = u.id::text AND a.created_at >= u.last_sign_in_at - interval '1 minute')
  ), page AS (
    SELECT * FROM events ORDER BY occurred_at DESC, id LIMIT 50 OFFSET _offset
  )
  SELECT jsonb_build_object('total', (SELECT count(*) FROM events), 'entries', coalesce((
    SELECT jsonb_agg(jsonb_build_object('id', id, 'occurredAt', occurred_at, 'account', account, 'action', action, 'source', source) ORDER BY occurred_at DESC, id) FROM page
  ), '[]'::jsonb), 'hasAuditHistory', EXISTS (SELECT 1 FROM auth.audit_log_entries)) INTO result;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_authorization_log(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_authorization_log(integer, integer) TO authenticated;
COMMENT ON FUNCTION public.admin_authorization_log(integer, integer) IS 'Admin-only sanitized authentication history; falls back to last successful sign-in when auth audit history is unavailable. No tokens or IP addresses exposed.';