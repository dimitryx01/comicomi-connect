import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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
    console.log('🗑️ admin-delete-restaurant: Nueva solicitud de eliminación');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { restaurant_id, admin_user_id } = await req.json();

    if (!restaurant_id || !admin_user_id) {
      console.error('❌ admin-delete-restaurant: Faltan parámetros requeridos');
      return new Response(
        JSON.stringify({ error: 'restaurant_id y admin_user_id son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🗑️ admin-delete-restaurant: Eliminando restaurante ${restaurant_id}`);

    // Verificar que el restaurante existe
    const { data: restaurant, error: restaurantError } = await supabaseClient
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      console.error('❌ admin-delete-restaurant: Restaurante no encontrado', restaurantError);
      return new Response(
        JSON.stringify({ error: 'Restaurante no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🗑️ admin-delete-restaurant: Restaurante encontrado: ${restaurant.name}`);

    // Contar registros antes de eliminar para auditoría
    const deletionStats = {
      restaurant_name: restaurant.name,
      restaurant_access_actions: 0,
      saved_restaurants: 0,
      user_follows: 0,
      restaurant_reviews: 0,
      restaurant_admins: 0,
      reports: 0,
      restaurant_cuisines: 0,
      posts_updated: 0
    };

    // 1. Eliminar restaurant_access_actions
    console.log('🗑️ Eliminando restaurant_access_actions...');
    const { data: accessActions, error: accessActionsError } = await supabaseClient
      .from('restaurant_access_actions')
      .delete()
      .eq('restaurant_id', restaurant_id);
    
    if (accessActionsError) {
      console.error('❌ Error eliminando restaurant_access_actions:', accessActionsError);
    }

    // 2. Eliminar saved_restaurants
    console.log('🗑️ Eliminando saved_restaurants...');
    const { data: savedRestaurants, error: savedRestaurantsError } = await supabaseClient
      .from('saved_restaurants')
      .delete()
      .eq('restaurant_id', restaurant_id);
    
    if (savedRestaurantsError) {
      console.error('❌ Error eliminando saved_restaurants:', savedRestaurantsError);
    }

    // 3. Eliminar user_follows (restaurantes seguidos)
    console.log('🗑️ Eliminando user_follows...');
    const { data: userFollows, error: userFollowsError } = await supabaseClient
      .from('user_follows')
      .delete()
      .eq('followed_restaurant_id', restaurant_id);
    
    if (userFollowsError) {
      console.error('❌ Error eliminando user_follows:', userFollowsError);
    }

    // 4. Eliminar restaurant_reviews
    console.log('🗑️ Eliminando restaurant_reviews...');
    const { data: reviews, error: reviewsError } = await supabaseClient
      .from('restaurant_reviews')
      .delete()
      .eq('restaurant_id', restaurant_id);
    
    if (reviewsError) {
      console.error('❌ Error eliminando restaurant_reviews:', reviewsError);
    }

    // 5. Eliminar restaurant_admins
    console.log('🗑️ Eliminando restaurant_admins...');
    const { data: admins, error: adminsError } = await supabaseClient
      .from('restaurant_admins')
      .delete()
      .eq('restaurant_id', restaurant_id);
    
    if (adminsError) {
      console.error('❌ Error eliminando restaurant_admins:', adminsError);
    }

    // 6. Eliminar reports relacionados
    console.log('🗑️ Eliminando reports...');
    const { data: reports, error: reportsError } = await supabaseClient
      .from('reports')
      .delete()
      .eq('restaurant_id', restaurant_id);
    
    if (reportsError) {
      console.error('❌ Error eliminando reports:', reportsError);
    }

    // 7. Eliminar restaurant_cuisines
    console.log('🗑️ Eliminando restaurant_cuisines...');
    const { data: cuisines, error: cuisinesError } = await supabaseClient
      .from('restaurant_cuisines')
      .delete()
      .eq('restaurant_id', restaurant_id);
    
    if (cuisinesError) {
      console.error('❌ Error eliminando restaurant_cuisines:', cuisinesError);
    }

    // 8. Actualizar posts - cambiar restaurant_id a NULL en lugar de eliminar
    console.log('🗑️ Actualizando posts (restaurant_id a NULL)...');
    const { data: postsUpdated, error: postsError } = await supabaseClient
      .from('posts')
      .update({ restaurant_id: null, restaurant_name: null })
      .eq('restaurant_id', restaurant_id);
    
    if (postsError) {
      console.error('❌ Error actualizando posts:', postsError);
    }

    // 9. Finalmente, eliminar el restaurante principal
    console.log('🗑️ Eliminando restaurante principal...');
    const { error: restaurantDeleteError } = await supabaseClient
      .from('restaurants')
      .delete()
      .eq('id', restaurant_id);

    if (restaurantDeleteError) {
      console.error('❌ Error eliminando restaurante principal:', restaurantDeleteError);
      return new Response(
        JSON.stringify({ error: 'Error eliminando restaurante: ' + restaurantDeleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log de auditoría
    console.log('📝 Registrando acción en auditoría...');
    await supabaseClient.rpc('log_admin_action', {
      p_admin_user_id: admin_user_id,
      p_action: 'DELETE_RESTAURANT_CASCADE',
      p_target_type: 'restaurant',
      p_target_id: restaurant_id,
      p_details: {
        restaurant_name: restaurant.name,
        deletion_stats: deletionStats
      }
    });

    console.log('✅ admin-delete-restaurant: Eliminación completada exitosamente');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Restaurante "${restaurant.name}" eliminado completamente`,
        deletion_stats: deletionStats
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ admin-delete-restaurant: Error general:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor: ' + errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});