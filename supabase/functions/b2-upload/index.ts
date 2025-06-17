
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuración de Backblaze B2
const B2_CONFIG = {
  bucketName: 'comicomi-media',
  bucketId: '982e885f21647cdd9279081e',
  applicationKeyId: '0058e8f14cd298e0000000006',
  applicationKey: 'K005fw99zgj3uIjByaUNQsblnUk3Xb4',
  region: 'us-east-005',
  endpoint: 's3.us-east-005.backblazeb2.com'
};

interface B2AuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
}

// Autenticar con B2 API
async function authenticateB2(): Promise<B2AuthResponse> {
  const authString = btoa(`${B2_CONFIG.applicationKeyId}:${B2_CONFIG.applicationKey}`);
  
  const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authString}`
    }
  });

  if (!response.ok) {
    throw new Error('Error autenticando con B2');
  }

  return await response.json();
}

// Obtener URL de subida
async function getUploadUrl(authToken: string, apiUrl: string): Promise<{ uploadUrl: string; authorizationToken: string }> {
  const response = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: 'POST',
    headers: {
      'Authorization': authToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bucketId: B2_CONFIG.bucketId
    })
  });

  if (!response.ok) {
    throw new Error('Error obteniendo URL de subida');
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return new Response(
        JSON.stringify({ error: 'fileName y contentType son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generando URL de subida para:', fileName);

    // 1. Autenticar con B2
    const authResponse = await authenticateB2();
    
    // 2. Obtener URL de subida
    const uploadResponse = await getUploadUrl(authResponse.authorizationToken, authResponse.apiUrl);
    
    // 3. Generar URL final del archivo
    const fileUrl = `${authResponse.downloadUrl}/file/${B2_CONFIG.bucketName}/${fileName}`;

    return new Response(
      JSON.stringify({
        uploadUrl: uploadResponse.uploadUrl,
        authorizationToken: uploadResponse.authorizationToken,
        fileUrl: fileUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en b2-upload function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
