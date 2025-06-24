
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=3300, s-maxage=3300', // Cache por 55 minutos
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
  console.log('🔐 b2-signed-url: Iniciando autenticación con B2...');
  
  const authString = btoa(`${B2_CONFIG.applicationKeyId}:${B2_CONFIG.applicationKey}`);
  
  try {
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
  } catch (error) {
    console.error('💥 b2-signed-url: Error crítico en autenticación:', error);
    throw error;
  }
}

// Generar URL de descarga autorizada con tiempo extendido
async function generateDownloadAuthorization(
  authToken: string, 
  apiUrl: string, 
  fileNamePrefix: string, 
  validDurationInSeconds: number = 3900 // 65 minutos por defecto
): Promise<string> {
  console.log('🔗 b2-signed-url: Generando autorización de descarga para:', {
    fileNamePrefix,
    validDurationInSeconds,
    expirationTime: new Date(Date.now() + validDurationInSeconds * 1000).toISOString()
  });
  
  try {
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
      console.error('❌ b2-signed-url: Error obteniendo autorización:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        fileNamePrefix
      });
      throw new Error(`Error obteniendo autorización de descarga: ${response.status} - ${errorText}`);
    }

    const authData = await response.json();
    console.log('✅ b2-signed-url: Autorización de descarga obtenida exitosamente:', {
      fileNamePrefix,
      expiresIn: validDurationInSeconds + 's',
      authTokenLength: authData.authorizationToken?.length
    });
    return authData.authorizationToken;
  } catch (error) {
    console.error('💥 b2-signed-url: Error crítico obteniendo autorización:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 b2-signed-url: Nueva solicitud de URL firmada recibida');
    
    const { fileId, expiresIn = 3900 } = await req.json(); // 65 minutos por defecto

    console.log('📋 b2-signed-url: DIAGNÓSTICO COMPLETO:', { 
      fileId: fileId?.substring(0, 50) + '...',
      expiresIn,
      requestedExpiration: new Date(Date.now() + expiresIn * 1000).toISOString(),
      bucketName: B2_CONFIG.bucketName,
      bucketId: B2_CONFIG.bucketId,
      endpoint: B2_CONFIG.endpoint
    });

    if (!fileId) {
      console.error('❌ b2-signed-url: fileId es requerido');
      return new Response(
        JSON.stringify({ error: 'fileId es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Autenticar con B2
    const authResponse = await authenticateB2();
    
    console.log('🔍 b2-signed-url: DATOS DE AUTENTICACIÓN:', {
      apiUrl: authResponse.apiUrl,
      downloadUrl: authResponse.downloadUrl,
      hasAuthToken: !!authResponse.authorizationToken
    });
    
    // 2. Generar autorización de descarga para el archivo específico con tiempo extendido
    const downloadAuthToken = await generateDownloadAuthorization(
      authResponse.authorizationToken,
      authResponse.apiUrl,
      fileId,
      expiresIn
    );

    // 3. Construir URL firmada
    const signedUrl = `${authResponse.downloadUrl}/file/${B2_CONFIG.bucketName}/${fileId}?Authorization=${downloadAuthToken}`;

    console.log('🔍 b2-signed-url: URL FIRMADA GENERADA - DIAGNÓSTICO COMPLETO:', {
      fileId: fileId?.substring(0, 50) + '...',
      fullSignedUrl: signedUrl,
      expiresIn,
      urlLength: signedUrl.length,
      hasAuthParam: signedUrl.includes('Authorization='),
      authTokenPreview: downloadAuthToken.substring(0, 20) + '...',
      bucketInUrl: signedUrl.includes(B2_CONFIG.bucketName),
      downloadUrlBase: authResponse.downloadUrl
    });

    // 4. PRUEBA MANUAL: Log para copiar y pegar en navegador
    console.log('🌐 PARA PRUEBA MANUAL - COPIA ESTA URL EN NAVEGADOR INCÓGNITO:');
    console.log(signedUrl);

    return new Response(
      JSON.stringify({ 
        signedUrl,
        expiresIn,
        generatedAt: new Date().toISOString(),
        debugInfo: {
          bucketName: B2_CONFIG.bucketName,
          fileId,
          downloadUrlBase: authResponse.downloadUrl,
          authTokenLength: downloadAuthToken.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 b2-signed-url: Error crítico en función:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Revisa los logs de la función para más información',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
