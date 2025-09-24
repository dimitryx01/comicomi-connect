
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 b2-delete: Nueva solicitud de eliminación recibida');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obtener datos del request
    const { fileId } = await req.json();
    console.log('📋 b2-delete: Datos recibidos:', { fileId });

    if (!fileId) {
      throw new Error('fileId es requerido');
    }

    // Obtener credenciales B2 de los secrets
    const B2_APPLICATION_KEY_ID = Deno.env.get('B2_APPLICATION_KEY_ID');
    const B2_APPLICATION_KEY = Deno.env.get('B2_APPLICATION_KEY');
    const B2_BUCKET_ID = Deno.env.get('B2_BUCKET_ID');

    if (!B2_APPLICATION_KEY_ID || !B2_APPLICATION_KEY || !B2_BUCKET_ID) {
      throw new Error('Credenciales B2 no configuradas');
    }

    console.log('🔐 b2-delete: Iniciando autenticación con B2...');

    // 1. Autenticar con B2
    const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${B2_APPLICATION_KEY_ID}:${B2_APPLICATION_KEY}`)}`
      }
    });

    if (!authResponse.ok) {
      throw new Error(`Error autenticando con B2: ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    console.log('✅ b2-delete: Autenticación B2 exitosa');

    // 2. Obtener información del archivo
    console.log('🔍 b2-delete: Obteniendo información del archivo:', fileId);
    
    const listResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_file_names`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId: B2_BUCKET_ID,
        startFileName: fileId,
        maxFileCount: 1
      })
    });

    if (!listResponse.ok) {
      throw new Error(`Error listando archivos: ${listResponse.statusText}`);
    }

    const listData = await listResponse.json();
    const file = listData.files?.find((f: any) => f.fileName === fileId);

    if (!file) {
      console.log('⚠️ b2-delete: Archivo no encontrado, considerando como eliminado exitosamente');
      return new Response(JSON.stringify({
        success: true,
        message: 'Archivo no encontrado (posiblemente ya eliminado)'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ b2-delete: Archivo encontrado, procediendo a eliminar...');

    // 3. Eliminar el archivo
    const deleteResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_delete_file_version`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileId: file.fileId,
        fileName: file.fileName
      })
    });

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.text();
      throw new Error(`Error eliminando archivo: ${deleteResponse.statusText} - ${errorData}`);
    }

    const deleteData = await deleteResponse.json();
    console.log('✅ b2-delete: Archivo eliminado exitosamente de B2');

    return new Response(JSON.stringify({
      success: true,
      fileId: deleteData.fileName,
      deletedFileId: deleteData.fileId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ b2-delete: Error eliminando archivo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido eliminando archivo';
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
