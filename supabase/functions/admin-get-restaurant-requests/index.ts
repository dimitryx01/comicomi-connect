import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { admin_user_id, status_filter, search_term } = await req.json();

    if (!admin_user_id) {
      return new Response(
        JSON.stringify({ error: 'Admin user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate admin user and check permissions
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id, is_active')
      .eq('id', admin_user_id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      console.error('Admin validation error:', adminError);
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive admin user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if admin has required role
    const { data: adminRoles, error: rolesError } = await supabase
      .from('admin_user_roles')
      .select('role')
      .eq('admin_user_id', admin_user_id);

    if (rolesError || !adminRoles?.some(r => r.role === 'gestor_establecimientos')) {
      console.error('Admin roles check error:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build query for restaurant admin requests
    let query = supabase
      .from('restaurant_admin_requests')
      .select(`
        *,
        requester_user:users!restaurant_admin_requests_requester_user_id_fkey(
          id,
          full_name,
          username,
          email,
          avatar_url
        ),
        restaurant:restaurants!restaurant_admin_requests_restaurant_id_fkey(
          id,
          name,
          location,
          image_url
        ),
        moderator:admin_users!restaurant_admin_requests_moderated_by_admin_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status_filter && status_filter !== 'all') {
      query = query.eq('status', status_filter);
    }

    // Apply search filter
    if (search_term && search_term.trim()) {
      // Search in requester name, email, restaurant name
      query = query.or(`
        requester_user.full_name.ilike.%${search_term}%,
        requester_user.email.ilike.%${search_term}%,
        restaurant.name.ilike.%${search_term}%
      `);
    }

    const { data: requests, error: requestsError } = await query;

    if (requestsError) {
      console.error('Error fetching restaurant requests:', requestsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch requests' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully fetched ${requests?.length || 0} restaurant access requests for admin ${admin_user_id}`);

    return new Response(
      JSON.stringify({ data: requests || [] }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in admin-get-restaurant-requests function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});