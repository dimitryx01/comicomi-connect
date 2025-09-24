import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuración de Backblaze B2 - Bucket Público
const B2_PUBLIC_CONFIG = {
  bucketName: 'comicomi-media-public',
  bucketId: 'b81e08df01447ccd9299081e',
  applicationKeyId: '0058e8f14cd298e0000000007',
  applicationKey: 'K005J0eLVnJE5K7SpzAIYxrUV3pM6qM',
  region: 'us-east-005',
  endpoint: 's3.us-east-005.backblazeb2.com'
};

interface B2AuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
}

interface B2UploadUrlResponse {
  uploadUrl: string;
  authorizationToken: string;
}

// Autenticar con B2 API
async function authenticateB2(): Promise<B2AuthResponse> {
  console.log('🔐 b2-upload-public: Iniciando autenticación con B2...');
  
  const authString = btoa(`${B2_PUBLIC_CONFIG.applicationKeyId}:${B2_PUBLIC_CONFIG.applicationKey}`);
  
  try {
    const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ b2-upload-public: Error en autenticación B2:', response.status, errorText);
      throw new Error(`Error autenticando con B2: ${response.status} - ${errorText}`);
    }

    const authData = await response.json();
    console.log('✅ b2-upload-public: Autenticación B2 exitosa');
    return authData;
  } catch (error) {
    console.error('💥 b2-upload-public: Error crítico en autenticación:', error);
    throw error;
  }
}

// Obtener URL de subida
async function getUploadUrl(authToken: string, apiUrl: string): Promise<B2UploadUrlResponse> {
  console.log('📝 b2-upload-public: Obteniendo URL de subida...');
  
  try {
    const response = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId: B2_PUBLIC_CONFIG.bucketId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ b2-upload-public: Error obteniendo URL de subida:', response.status, errorText);
      throw new Error(`Error obteniendo URL de subida: ${response.status} - ${errorText}`);
    }

    const uploadData = await response.json();
    console.log('✅ b2-upload-public: URL de subida obtenida exitosamente');
    return uploadData;
  } catch (error) {
    console.error('💥 b2-upload-public: Error crítico obteniendo URL:', error);
    throw error;
  }
}

// Función para calcular SHA1
async function calculateSHA1(file: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-1', file);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 b2-upload-public: Nueva solicitud de subida al bucket público recibida');
    
    // Leer el archivo desde el cuerpo de la petición
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file || !fileName) {
      console.error('❌ b2-upload-public: Faltan archivo o nombre');
      return new Response(
        JSON.stringify({ error: 'Se requiere archivo y nombre de archivo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📋 b2-upload-public: Datos recibidos:', {
      fileName,
      fileSize: file.size,
      fileType: file.type
    });

    // 1. Autenticar con B2
    const authResponse = await authenticateB2();
    
    // 2. Obtener URL de subida
    const uploadResponse = await getUploadUrl(authResponse.authorizationToken, authResponse.apiUrl);
    
    // 3. Preparar archivo para subida
    const fileBuffer = await file.arrayBuffer();
    const fileSHA1 = await calculateSHA1(fileBuffer);
    
    console.log('🔐 b2-upload-public: Preparando subida al bucket público:', {
      fileName,
      fileSize: fileBuffer.byteLength,
      fileSHA1
    });

    // 4. Subir archivo directamente a B2
    const uploadToB2Response = await fetch(uploadResponse.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': uploadResponse.authorizationToken,
        'X-Bz-File-Name': encodeURIComponent(fileName),
        'Content-Type': file.type,
        'Content-Length': fileBuffer.byteLength.toString(),
        'X-Bz-Content-Sha1': fileSHA1
      },
      body: fileBuffer
    });

    if (!uploadToB2Response.ok) {
      const errorText = await uploadToB2Response.text();
      console.error('❌ b2-upload-public: Error subiendo a B2:', uploadToB2Response.status, errorText);
      throw new Error(`Error subiendo archivo a B2: ${uploadToB2Response.status} - ${errorText}`);
    }

    const uploadResult = await uploadToB2Response.json();
    console.log('✅ b2-upload-public: Archivo subido exitosamente al bucket público:', {
      fileId: uploadResult.fileId,
      fileName: uploadResult.fileName
    });

    // 5. Generar URL pública final del archivo
    const publicUrl = `${authResponse.downloadUrl}/file/${B2_PUBLIC_CONFIG.bucketName}/${fileName}`;

    const response = {
      success: true,
      url: publicUrl,
      publicUrl: publicUrl, // URL directa para acceso público
      fileId: fileName,
      fileName: fileName,
      uploadResult: uploadResult
    };

    console.log('🎉 b2-upload-public: Respuesta exitosa generada con URL pública:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 b2-upload-public: Error crítico en función:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        details: 'Revisa los logs de la función para más información'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});