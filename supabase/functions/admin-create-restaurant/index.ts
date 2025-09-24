import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { 
      adminUserId, 
      restaurantData 
    } = await req.json()

    console.log('Admin creating restaurant:', { adminUserId, restaurantName: restaurantData.name })

    if (!adminUserId) {
      return new Response(
        JSON.stringify({ error: 'Admin user ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar que el admin user existe y tiene el rol correcto
    const { data: adminCheck, error: adminError } = await supabase
      .from('admin_user_roles')
      .select(`
        admin_user_id,
        role,
        admin_users!admin_user_roles_admin_user_id_fkey (
          id,
          is_active
        )
      `)
      .eq('admin_user_id', adminUserId)
      .eq('role', 'gestor_establecimientos')
      .eq('admin_users.is_active', true)
      .single()

    if (adminError || !adminCheck) {
      console.error('Admin verification failed:', adminError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid admin or insufficient permissions' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Admin verified:', adminCheck)

    // Crear el restaurante usando el service role key (bypassing RLS)
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        name: restaurantData.name,
        description: restaurantData.description,
        location_id: restaurantData.location_id,
        cuisine_type: restaurantData.cuisine_type,
        phone: restaurantData.phone,
        email: restaurantData.email,
        website: restaurantData.website,
        image_url: restaurantData.image_url,
        is_verified: restaurantData.is_verified || false
      })
      .select()
      .single()

    if (restaurantError) {
      console.error('Restaurant creation failed:', restaurantError)
      return new Response(
        JSON.stringify({ error: 'Failed to create restaurant', details: restaurantError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Si hay cuisine types, agregarlos a la tabla de relación
    if (restaurantData.cuisine_ids && restaurantData.cuisine_ids.length > 0) {
      const cuisineInserts = restaurantData.cuisine_ids.map((cuisineId: string) => ({
        restaurant_id: restaurant.id,
        cuisine_id: cuisineId
      }))

      const { error: cuisineError } = await supabase
        .from('restaurant_cuisines')
        .insert(cuisineInserts)

      if (cuisineError) {
        console.error('Cuisine relationship creation failed:', cuisineError)
        // No fallar completamente, pero logear el error
      }
    }

    // Log the admin action
    await supabase
      .from('admin_audit_log')
      .insert({
        admin_user_id: adminUserId,
        action: 'CREATE_RESTAURANT',
        target_type: 'restaurant',
        target_id: restaurant.id,
        details: {
          restaurant_name: restaurant.name,
          location_id: restaurant.location_id
        }
      })

    console.log('Restaurant created successfully:', restaurant.id)

    return new Response(
      JSON.stringify({ success: true, restaurant }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in admin-create-restaurant function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})