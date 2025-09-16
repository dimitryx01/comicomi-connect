-- Add validation to prevent more than 2 requests per user per restaurant
-- Create a function to check if user can make a new request
CREATE OR REPLACE FUNCTION public.can_user_request_restaurant_access(
  p_user_id uuid,
  p_restaurant_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  revoked_count INTEGER;
  has_active_admin BOOLEAN;
  is_user_admin BOOLEAN;
BEGIN
  -- Check if restaurant already has an active admin
  SELECT EXISTS(
    SELECT 1 FROM restaurant_admins 
    WHERE restaurant_id = p_restaurant_id
  ) INTO has_active_admin;
  
  -- Check if user is already an admin
  SELECT EXISTS(
    SELECT 1 FROM restaurant_admins 
    WHERE restaurant_id = p_restaurant_id AND user_id = p_user_id
  ) INTO is_user_admin;
  
  -- Count revoked requests for this user and restaurant
  SELECT COUNT(*)::INTEGER INTO revoked_count
  FROM restaurant_admin_requests
  WHERE restaurant_id = p_restaurant_id 
    AND requester_user_id = p_user_id 
    AND status = 'revoked';
  
  -- Return false if:
  -- 1. Restaurant already has an admin
  -- 2. User is already an admin
  -- 3. User has 2 or more revoked requests
  IF has_active_admin OR is_user_admin OR revoked_count >= 2 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;