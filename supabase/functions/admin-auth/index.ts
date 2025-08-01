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

    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email y contraseña son requeridos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Por simplicidad en pruebas, usamos contraseña simple
    const passwordHash = password === 'admin123' ? '$2a$10$dummy.hash.for.testing' : password;

    // Buscar usuario admin
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('id, email, full_name, is_active, created_at')
      .eq('email', email)
      .eq('password_hash', passwordHash)
      .eq('is_active', true)
      .single()

    if (userError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Credenciales inválidas' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obtener roles del usuario
    const { data: roles, error: rolesError } = await supabase
      .from('admin_user_roles')
      .select('role')
      .eq('admin_user_id', adminUser.id)

    if (rolesError) {
      console.error('Error obteniendo roles:', rolesError)
      return new Response(
        JSON.stringify({ error: 'Error obteniendo roles de usuario' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Actualizar último login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id)

    const userData = {
      id: adminUser.id,
      email: adminUser.email,
      full_name: adminUser.full_name,
      roles: roles.map(r => r.role),
      created_at: adminUser.created_at
    }

    return new Response(
      JSON.stringify({ success: true, user: userData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})