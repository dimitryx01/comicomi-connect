import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { admin_user_id, post_id } = await req.json();

    if (!admin_user_id || !post_id) {
      return new Response(
        JSON.stringify({ error: "admin_user_id y post_id son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar que el admin existe y está activo
    const { data: adminUser, error: adminErr } = await supabase
      .from("admin_users")
      .select("id, is_active")
      .eq("id", admin_user_id)
      .maybeSingle();

    if (adminErr) {
      console.error("Error obteniendo admin_user:", adminErr);
      return new Response(
        JSON.stringify({ error: "No se pudo verificar el usuario administrador" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!adminUser || adminUser.is_active !== true) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Obtener roles del admin
    const { data: adminRoles, error: rolesError } = await supabase
      .from("admin_user_roles")
      .select("role")
      .eq("admin_user_id", admin_user_id);

    if (rolesError) {
      console.error("Error verificando roles:", rolesError);
      return new Response(
        JSON.stringify({ error: "No se pudo verificar los roles del administrador" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isAuthorized = Array.isArray(adminRoles) && adminRoles.some((r: any) =>
      r.role === "admin_master" || r.role === "moderador_contenido"
    );

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Obtener detalle del post (ignorará RLS por usar service role)
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        created_at,
        author_id,
        is_public,
        is_reported,
        media_urls,
        location,
        restaurant_id,
        users:users!posts_author_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        restaurants:restaurants (
          id,
          name
        )
      `)
      .eq("id", post_id)
      .single();

    if (error) {
      console.error("Error obteniendo post:", error);
      return new Response(
        JSON.stringify({ error: "No se encontró la publicación" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      author_id: data.author_id,
      author_name: (data.users as any)?.full_name ?? "Usuario",
      author_username: (data.users as any)?.username ?? "usuario",
      author_avatar: (data.users as any)?.avatar_url ?? "",
      media_urls: data.media_urls,
      location: data.location,
      restaurant_id: (data.restaurants as any)?.id ?? null,
      restaurant_name: (data.restaurants as any)?.name ?? null,
      is_public: data.is_public,
      is_reported: data.is_reported,
    };

    return new Response(JSON.stringify({ success: true, post: response }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error inesperado:", e);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
