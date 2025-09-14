-- Update admin_revoke_restaurant_access to accept admin_user_id parameter
CREATE OR REPLACE FUNCTION public.admin_revoke_restaurant_access(
  request_id uuid, 
  notes text,
  p_admin_user_id uuid DEFAULT NULL::uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_data RECORD;
  current_admin_id UUID;
BEGIN
  -- Use provided admin_user_id or fall back to auth.uid()
  current_admin_id := COALESCE(p_admin_user_id, auth.uid());
  
  -- Validate that the admin user exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = current_admin_id AND is_active = true
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Validate that the admin has the required role
  IF NOT EXISTS (
    SELECT 1 FROM admin_user_roles aur
    JOIN admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = current_admin_id 
      AND au.is_active = true 
      AND aur.role = 'gestor_establecimientos'::admin_role
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Get request data and validate
  SELECT * INTO request_data 
  FROM restaurant_admin_requests 
  WHERE id = request_id AND status = 'approved';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update request status
  UPDATE restaurant_admin_requests 
  SET 
    status = 'revoked',
    moderated_by_admin_id = current_admin_id,
    moderated_at = now(),
    moderation_notes = notes,
    updated_at = now()
  WHERE id = request_id;
  
  -- Remove user from restaurant admins
  DELETE FROM restaurant_admins 
  WHERE restaurant_id = request_data.restaurant_id 
  AND user_id = request_data.requester_user_id;
  
  -- Log the action
  PERFORM log_restaurant_access_action(
    current_admin_id,
    'revoke',
    request_id,
    request_data.restaurant_id,
    request_data.requester_user_id,
    notes,
    'approved',
    'revoked'
  );
  
  -- Log admin action in main audit log
  PERFORM log_admin_action(
    current_admin_id,
    'REVOKE_RESTAURANT_ACCESS',
    'restaurant_admin_request',
    request_id,
    jsonb_build_object(
      'restaurant_id', request_data.restaurant_id,
      'user_id', request_data.requester_user_id,
      'notes', notes
    )
  );
  
  RETURN TRUE;
END;
$function$;