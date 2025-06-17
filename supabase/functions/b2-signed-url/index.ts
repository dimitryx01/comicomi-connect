
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

// Función para generar URL firmada usando S3 compatible API
async function generateSignedUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
  try {
    // Para URLs firmadas usando S3 compatible API de B2
    // Nota: Esta es una implementación simplificada
    // En producción se recomienda usar una librería como AWS SDK
    
    const timestamp = Math.floor(Date.now() / 1000) + expiresIn;
    const baseUrl = `https://${B2_CONFIG.endpoint}/${B2_CONFIG.bucketName}/${fileName}`;
    
    // Generar signature (implementación simplificada)
    const stringToSign = `GET\n\n\n${timestamp}\n/${B2_CONFIG.bucketName}/${fileName}`;
    
    // En una implementación real, usarías HMAC-SHA1 con la application key
    // Por ahora retornamos la URL base con parámetros de expiración
    return `${baseUrl}?X-Amz-Expires=${expiresIn}&X-Amz-Date=${new Date().toISOString()}`;
    
  } catch (error) {
    console.error('Error generando URL firmada:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileId, userId, expiresIn = 3600 } = await req.json();

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'fileId es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generando URL firmada para:', fileId, 'usuario:', userId);

    // TODO: Verificar permisos del usuario para acceder al archivo
    // if (userId) {
    //   // Verificar en base de datos si el usuario tiene acceso al archivo
    // }

    const signedUrl = await generateSignedUrl(fileId, expiresIn);

    return new Response(
      JSON.stringify({ signedUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en b2-signed-url function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
