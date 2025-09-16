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

    // Get restaurant admin requests first
    let query = supabase
      .from('restaurant_admin_requests')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status_filter && status_filter !== 'all') {
      query = query.eq('status', status_filter);
    }

    const { data: requests, error: requestsError } = await query;

    if (requestsError) {
      console.error('Error fetching restaurant requests:', requestsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch requests' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!requests || requests.length === 0) {
      return new Response(
        JSON.stringify({ data: [] }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get unique user IDs and restaurant IDs
    const userIds = [...new Set(requests.map(r => r.requester_user_id).filter(Boolean))];
    const restaurantIds = [...new Set(requests.map(r => r.restaurant_id).filter(Boolean))];
    const adminIds = [...new Set(requests.map(r => r.moderated_by_admin_id).filter(Boolean))];

    // Fetch related data
    const [usersResponse, restaurantsResponse, adminsResponse] = await Promise.all([
      userIds.length > 0 ? supabase
        .from('users')
        .select('id, full_name, username, email, avatar_url')
        .in('id', userIds) : Promise.resolve({ data: [], error: null }),
      
      restaurantIds.length > 0 ? supabase
        .from('restaurants')
        .select('id, name, location, image_url')
        .in('id', restaurantIds) : Promise.resolve({ data: [], error: null }),
      
      adminIds.length > 0 ? supabase
        .from('admin_users')
        .select('id, full_name, email')
        .in('id', adminIds) : Promise.resolve({ data: [], error: null })
    ]);

    // Create lookup maps
    const usersMap = new Map(usersResponse.data?.map(u => [u.id, u]) || []);
    const restaurantsMap = new Map(restaurantsResponse.data?.map(r => [r.id, r]) || []);
    const adminsMap = new Map(adminsResponse.data?.map(a => [a.id, a]) || []);

    // Combine data
    let enrichedRequests = requests.map(request => ({
      ...request,
      requester_user: usersMap.get(request.requester_user_id) || null,
      restaurant: restaurantsMap.get(request.restaurant_id) || null,
      moderator: request.moderated_by_admin_id ? adminsMap.get(request.moderated_by_admin_id) || null : null
    }));

    // Apply search filter after enriching data
    if (search_term && search_term.trim()) {
      const searchLower = search_term.toLowerCase();
      enrichedRequests = enrichedRequests.filter(request => {
        const userName = request.requester_user?.full_name?.toLowerCase() || '';
        const userEmail = request.requester_user?.email?.toLowerCase() || '';
        const restaurantName = request.restaurant?.name?.toLowerCase() || '';
        
        return userName.includes(searchLower) || 
               userEmail.includes(searchLower) || 
               restaurantName.includes(searchLower);
      });
    }

    console.log(`Successfully fetched ${enrichedRequests?.length || 0} restaurant access requests for admin ${admin_user_id}`);

    return new Response(
      JSON.stringify({ data: enrichedRequests || [] }),
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