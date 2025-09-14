-- Fix the admin_approve_restaurant_access function to resolve SQL ambiguity
-- and update it to handle fileId storage instead of URLs

DROP FUNCTION IF EXISTS public.admin_approve_restaurant_access(uuid, text, text, text, text);

CREATE OR REPLACE FUNCTION public.admin_approve_restaurant_access(
  request_id uuid, 
  dni_file_id text, 
  selfie_file_id text, 
  ownership_file_id text, 
  notes text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_data RECORD;
  documents_json JSONB;
BEGIN
  -- Get request data and validate
  SELECT * INTO request_data 
  FROM restaurant_admin_requests 
  WHERE restaurant_admin_requests.id = request_id AND restaurant_admin_requests.status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Prepare documents JSON with fileIds
  documents_json := jsonb_build_object(
    'dni_file_id', dni_file_id,
    'selfie_file_id', selfie_file_id,
    'ownership_file_id', ownership_file_id
  );
  
  -- Update request status with fileIds instead of URLs
  UPDATE restaurant_admin_requests 
  SET 
    status = 'approved',
    moderated_by_admin_id = auth.uid(),
    moderated_at = now(),
    moderation_notes = notes,
    dni_scan_url = dni_file_id,  -- Store fileId in URL fields for now
    selfie_url = selfie_file_id,
    ownership_proof_url = ownership_file_id,
    updated_at = now()
  WHERE restaurant_admin_requests.id = request_id;
  
  -- Add user as restaurant admin (if not exists)
  INSERT INTO restaurant_admins (restaurant_id, user_id, role)
  VALUES (request_data.restaurant_id, request_data.requester_user_id, 'manager')
  ON CONFLICT (restaurant_id, user_id) DO NOTHING;
  
  -- Log the action
  PERFORM log_restaurant_access_action(
    auth.uid(),
    'approve',
    request_id,
    request_data.restaurant_id,
    request_data.requester_user_id,
    notes,
    'pending',
    'approved',
    documents_json
  );
  
  -- Log admin action in main audit log
  PERFORM log_admin_action(
    auth.uid(),
    'APPROVE_RESTAURANT_ACCESS',
    'restaurant_admin_request',
    request_id,
    jsonb_build_object(
      'restaurant_id', request_data.restaurant_id,
      'user_id', request_data.requester_user_id,
      'notes', notes,
      'documents', documents_json
    )
  );
  
  RETURN TRUE;
END;
$function$;