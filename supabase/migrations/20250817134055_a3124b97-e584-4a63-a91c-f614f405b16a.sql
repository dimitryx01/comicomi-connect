-- Add RLS policy for users to delete their own pending requests
CREATE POLICY "Users can delete their pending requests" 
ON restaurant_admin_requests 
FOR DELETE 
USING (
  auth.uid() = requester_user_id 
  AND status = 'pending' 
  AND moderated_by_admin_id IS NULL
);

-- Add partial unique index to prevent multiple pending requests per user-restaurant
CREATE UNIQUE INDEX idx_unique_pending_request 
ON restaurant_admin_requests (requester_user_id, restaurant_id) 
WHERE status = 'pending';

-- Create audit table for restaurant access actions
CREATE TABLE restaurant_access_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'approve', 'reject', 'revoke', 'delete'
  request_id UUID NOT NULL REFERENCES restaurant_admin_requests(id),
  restaurant_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action_notes TEXT,
  previous_status TEXT,
  new_status TEXT,
  documents_uploaded JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE restaurant_access_actions ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit table
CREATE POLICY "Admin users can view restaurant access actions" 
ON restaurant_access_actions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admin_user_roles aur
  JOIN admin_users au ON aur.admin_user_id = au.id
  WHERE au.id = auth.uid() 
  AND au.is_active = true 
  AND aur.role = 'gestor_establecimientos'
));

-- Function to log restaurant access actions
CREATE OR REPLACE FUNCTION log_restaurant_access_action(
  p_admin_user_id UUID,
  p_action_type TEXT,
  p_request_id UUID,
  p_restaurant_id UUID,
  p_target_user_id UUID,
  p_action_notes TEXT DEFAULT NULL,
  p_previous_status TEXT DEFAULT NULL,
  p_new_status TEXT DEFAULT NULL,
  p_documents_uploaded JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  action_id UUID;
BEGIN
  INSERT INTO restaurant_access_actions (
    admin_user_id,
    action_type,
    request_id,
    restaurant_id,
    target_user_id,
    action_notes,
    previous_status,
    new_status,
    documents_uploaded
  )
  VALUES (
    p_admin_user_id,
    p_action_type,
    p_request_id,
    p_restaurant_id,
    p_target_user_id,
    p_action_notes,
    p_previous_status,
    p_new_status,
    p_documents_uploaded
  )
  RETURNING id INTO action_id;
  
  RETURN action_id;
END;
$$;

-- Update admin_approve_restaurant_access function to include logging
CREATE OR REPLACE FUNCTION admin_approve_restaurant_access(
  request_id uuid, 
  dni_url text, 
  selfie_url text, 
  ownership_url text, 
  notes text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_data RECORD;
  documents_json JSONB;
BEGIN
  -- Get request data and validate
  SELECT * INTO request_data 
  FROM restaurant_admin_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Prepare documents JSON
  documents_json := jsonb_build_object(
    'dni_scan_url', dni_url,
    'selfie_url', selfie_url,
    'ownership_proof_url', ownership_url
  );
  
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
$$;

-- Update admin_reject_restaurant_access function to include logging
CREATE OR REPLACE FUNCTION admin_reject_restaurant_access(request_id uuid, notes text)
RETURNS boolean
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
  
  -- Log the action
  PERFORM log_restaurant_access_action(
    auth.uid(),
    'reject',
    request_id,
    request_data.restaurant_id,
    request_data.requester_user_id,
    notes,
    'pending',
    'rejected'
  );
  
  -- Log admin action in main audit log
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

-- Update admin_revoke_restaurant_access function to include logging
CREATE OR REPLACE FUNCTION admin_revoke_restaurant_access(request_id uuid, notes text)
RETURNS boolean
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
  
  -- Log the action
  PERFORM log_restaurant_access_action(
    auth.uid(),
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