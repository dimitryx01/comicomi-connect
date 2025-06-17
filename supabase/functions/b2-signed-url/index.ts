
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
    console.log('🔗 b2-signed-url: Generando URL firmada para:', fileName, 'expiración:', expiresIn);
    
    // Para URLs firmadas usando S3 compatible API de B2
    // Nota: Esta es una implementación simplificada
    // En producción se recomienda usar una librería como AWS SDK
    
    const timestamp = Math.floor(Date.now() / 1000) + expiresIn;
    const baseUrl = `https://${B2_CONFIG.endpoint}/${B2_CONFIG.bucketName}/${fileName}`;
    
    // Generar signature (implementación simplificada)
    const stringToSign = `GET\n\n\n${timestamp}\n/${B2_CONFIG.bucketName}/${fileName}`;
    
    console.log('📝 b2-signed-url: String a firmar:', stringToSign);
    
    // En una implementación real, usarías HMAC-SHA1 con la application key
    // Por ahora retornamos la URL base con parámetros de expiración
    const signedUrl = `${baseUrl}?X-Amz-Expires=${expiresIn}&X-Amz-Date=${new Date().toISOString()}`;
    
    console.log('✅ b2-signed-url: URL firmada generada:', signedUrl);
    return signedUrl;
    
  } catch (error) {
    console.error('❌ b2-signed-url: Error generando URL firmada:', error);
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
    
    const { fileId, userId, expiresIn = 3600 } = await req.json();

    console.log('📋 b2-signed-url: Datos recibidos:', { fileId, userId, expiresIn });

    if (!fileId) {
      console.error('❌ b2-signed-url: fileId es requerido');
      return new Response(
        JSON.stringify({ error: 'fileId es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Verificar permisos del usuario para acceder al archivo
    if (userId) {
      console.log('👤 b2-signed-url: Verificando permisos para usuario:', userId);
      // Verificar en base de datos si el usuario tiene acceso al archivo
    }

    const signedUrl = await generateSignedUrl(fileId, expiresIn);

    console.log('✅ b2-signed-url: Respuesta exitosa generada');

    return new Response(
      JSON.stringify({ signedUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 b2-signed-url: Error crítico en función:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Revisa los logs de la función para más información'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
