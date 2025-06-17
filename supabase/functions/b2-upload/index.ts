
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

interface B2UploadUrlResponse {
  uploadUrl: string;
  authorizationToken: string;
}

// Autenticar con B2 API
async function authenticateB2(): Promise<B2AuthResponse> {
  console.log('🔐 b2-upload: Iniciando autenticación con B2...');
  
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
      console.error('❌ b2-upload: Error en autenticación B2:', response.status, errorText);
      throw new Error(`Error autenticando con B2: ${response.status} - ${errorText}`);
    }

    const authData = await response.json();
    console.log('✅ b2-upload: Autenticación B2 exitosa:', {
      apiUrl: authData.apiUrl,
      downloadUrl: authData.downloadUrl
    });
    return authData;
  } catch (error) {
    console.error('💥 b2-upload: Error crítico en autenticación:', error);
    throw error;
  }
}

// Obtener URL de subida
async function getUploadUrl(authToken: string, apiUrl: string): Promise<B2UploadUrlResponse> {
  console.log('📝 b2-upload: Obteniendo URL de subida...');
  
  try {
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
      const errorText = await response.text();
      console.error('❌ b2-upload: Error obteniendo URL de subida:', response.status, errorText);
      throw new Error(`Error obteniendo URL de subida: ${response.status} - ${errorText}`);
    }

    const uploadData = await response.json();
    console.log('✅ b2-upload: URL de subida obtenida exitosamente:', {
      uploadUrl: uploadData.uploadUrl,
      hasAuthToken: !!uploadData.authorizationToken
    });
    return uploadData;
  } catch (error) {
    console.error('💥 b2-upload: Error crítico obteniendo URL:', error);
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
    console.log('🚀 b2-upload: Nueva solicitud de subida recibida');
    
    // Leer el archivo desde el cuerpo de la petición
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file || !fileName) {
      console.error('❌ b2-upload: Faltan archivo o nombre');
      return new Response(
        JSON.stringify({ error: 'Se requiere archivo y nombre de archivo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📋 b2-upload: Datos recibidos:', {
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
    
    console.log('🔐 b2-upload: Preparando subida:', {
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
      console.error('❌ b2-upload: Error subiendo a B2:', uploadToB2Response.status, errorText);
      throw new Error(`Error subiendo archivo a B2: ${uploadToB2Response.status} - ${errorText}`);
    }

    const uploadResult = await uploadToB2Response.json();
    console.log('✅ b2-upload: Archivo subido exitosamente:', {
      fileId: uploadResult.fileId,
      fileName: uploadResult.fileName
    });

    // 5. Generar URL final del archivo
    const fileUrl = `${authResponse.downloadUrl}/file/${B2_CONFIG.bucketName}/${fileName}`;

    const response = {
      success: true,
      url: fileUrl,
      fileId: fileName,
      fileName: fileName,
      uploadResult: uploadResult
    };

    console.log('🎉 b2-upload: Respuesta exitosa generada:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 b2-upload: Error crítico en función:', error);
    
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
