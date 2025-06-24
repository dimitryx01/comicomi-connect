
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=3300, s-maxage=3300',
  'Vary': 'Accept-Encoding',
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
  console.log('🔐 b2-signed-url: Autenticando con B2...');
  
  const authString = btoa(`${B2_CONFIG.applicationKeyId}:${B2_CONFIG.applicationKey}`);
  
  const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authString}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ b2-signed-url: Error en autenticación B2:', response.status, errorText);
    throw new Error(`Error autenticando con B2: ${response.status} - ${errorText}`);
  }

  const authData = await response.json();
  console.log('✅ b2-signed-url: Autenticación B2 exitosa');
  return authData;
}

// Generar URL de descarga autorizada
async function generateDownloadAuthorization(
  authToken: string, 
  apiUrl: string, 
  fileNamePrefix: string, 
  validDurationInSeconds: number = 3600
): Promise<string> {
  console.log('🔗 b2-signed-url: Generando autorización de descarga para:', fileNamePrefix);
  
  const response = await fetch(`${apiUrl}/b2api/v2/b2_get_download_authorization`, {
    method: 'POST',
    headers: {
      'Authorization': authToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bucketId: B2_CONFIG.bucketId,
      fileNamePrefix: fileNamePrefix,
      validDurationInSeconds: validDurationInSeconds
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ b2-signed-url: Error obteniendo autorización:', response.status, errorText);
    throw new Error(`Error obteniendo autorización de descarga: ${response.status} - ${errorText}`);
  }

  const authData = await response.json();
  console.log('✅ b2-signed-url: Autorización de descarga obtenida');
  return authData.authorizationToken;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 b2-signed-url: Nueva solicitud de URL firmada');
    
    const { fileId, expiresIn = 3600 } = await req.json();

    if (!fileId) {
      console.error('❌ b2-signed-url: fileId es requerido');
      return new Response(
        JSON.stringify({ error: 'fileId es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Autenticar con B2
    const authResponse = await authenticateB2();
    
    // 2. Generar autorización de descarga
    const downloadAuthToken = await generateDownloadAuthorization(
      authResponse.authorizationToken,
      authResponse.apiUrl,
      fileId,
      expiresIn
    );

    // 3. Construir URL firmada
    const signedUrl = `${authResponse.downloadUrl}/file/${B2_CONFIG.bucketName}/${fileId}?Authorization=${downloadAuthToken}`;

    console.log('✅ b2-signed-url: URL firmada generada exitosamente');

    return new Response(
      JSON.stringify({ 
        signedUrl,
        expiresIn,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 b2-signed-url: Error en función:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
