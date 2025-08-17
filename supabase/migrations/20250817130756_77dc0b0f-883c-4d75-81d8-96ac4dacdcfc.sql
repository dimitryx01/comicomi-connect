-- Create restaurant_admin_requests table
CREATE TABLE public.restaurant_admin_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  requester_user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  tax_id TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
  moderation_notes TEXT,
  moderated_by_admin_id UUID,
  moderated_at TIMESTAMP WITH TIME ZONE,
  dni_scan_url TEXT,
  selfie_url TEXT,
  ownership_proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_user_id, restaurant_id)
);

-- Enable RLS
ALTER TABLE public.restaurant_admin_requests ENABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
CREATE TRIGGER update_restaurant_admin_requests_updated_at
  BEFORE UPDATE ON public.restaurant_admin_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
-- Users can view their own requests
CREATE POLICY "Users can view their own requests" 
  ON public.restaurant_admin_requests 
  FOR SELECT 
  USING (auth.uid() = requester_user_id);

-- Admin users can view all requests
CREATE POLICY "Admin users can view all requests" 
  ON public.restaurant_admin_requests 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM admin_user_roles aur
    JOIN admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = auth.uid() 
    AND au.is_active = true 
    AND aur.role = 'gestor_establecimientos'
  ));

-- Users can create their own requests
CREATE POLICY "Users can create their own requests" 
  ON public.restaurant_admin_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = requester_user_id);

-- Users can update their pending requests
CREATE POLICY "Users can update their pending requests" 
  ON public.restaurant_admin_requests 
  FOR UPDATE 
  USING (
    auth.uid() = requester_user_id 
    AND status = 'pending' 
    AND moderated_by_admin_id IS NULL
  );

-- Admin users can update any request
CREATE POLICY "Admin users can update any request" 
  ON public.restaurant_admin_requests 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM admin_user_roles aur
    JOIN admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = auth.uid() 
    AND au.is_active = true 
    AND aur.role = 'gestor_establecimientos'
  ));

-- Security definer functions for admin actions
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
SET search_path = public
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
SET search_path = public
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
SET search_path = public
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

-- Update restaurants table RLS to allow restaurant admins to edit
CREATE POLICY "Restaurant admins can update restaurants" 
  ON public.restaurants 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM restaurant_admins ra
    WHERE ra.restaurant_id = restaurants.id 
    AND ra.user_id = auth.uid()
  ));

-- Allow restaurant admins to insert restaurants
CREATE POLICY "Restaurant admins can create restaurants" 
  ON public.restaurants 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);