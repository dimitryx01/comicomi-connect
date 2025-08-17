-- Fix search_path for security functions
CREATE OR REPLACE FUNCTION public.admin_approve_restaurant_access(
  request_id UUID,
  dni_url TEXT,
  selfie_url TEXT,
  ownership_url TEXT,
  notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_data RECORD;
BEGIN
  -- Get request data and validate
  SELECT * INTO request_data 
  FROM restaurant_admin_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update request status
  UPDATE restaurant_admin_requests 
  SET 
    status = 'approved',
    moderated_by_admin_id = auth.uid(),
    moderated_at = now(),
    moderation_notes = notes,
    dni_scan_url = dni_url,
    selfie_url = selfie_url,
    ownership_proof_url = ownership_url,
    updated_at = now()
  WHERE id = request_id;
  
  -- Add user as restaurant admin (if not exists)
  INSERT INTO restaurant_admins (restaurant_id, user_id, role)
  VALUES (request_data.restaurant_id, request_data.requester_user_id, 'manager')
  ON CONFLICT (restaurant_id, user_id) DO NOTHING;
  
  -- Log admin action
  PERFORM log_admin_action(
    auth.uid(),
    'APPROVE_RESTAURANT_ACCESS',
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
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_restaurant_access(
  request_id UUID,
  notes TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_data RECORD;
BEGIN
  -- Get request data and validate
  SELECT * INTO request_data 
  FROM restaurant_admin_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update request status
  UPDATE restaurant_admin_requests 
  SET 
    status = 'rejected',
    moderated_by_admin_id = auth.uid(),
    moderated_at = now(),
    moderation_notes = notes,
    updated_at = now()
  WHERE id = request_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    auth.uid(),
    'REJECT_RESTAURANT_ACCESS',
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
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_restaurant_access(
  request_id UUID,
  notes TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_data RECORD;
BEGIN
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
    moderated_by_admin_id = auth.uid(),
    moderated_at = now(),
    moderation_notes = notes,
    updated_at = now()
  WHERE id = request_id;
  
  -- Remove user from restaurant admins
  DELETE FROM restaurant_admins 
  WHERE restaurant_id = request_data.restaurant_id 
  AND user_id = request_data.requester_user_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    auth.uid(),
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
$$;