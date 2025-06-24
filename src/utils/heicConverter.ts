
/**
 * Utilidad para convertir archivos HEIC/HEIF a JPEG
 */

// @ts-ignore - heic2any no tiene tipos TypeScript perfectos
import heic2any from 'heic2any';

interface ConversionResult {
  convertedFile: File;
  wasConverted: boolean;
  originalFormat: string;
}

/**
 * Verifica si un archivo es HEIC/HEIF
 */
export const isHEICFile = (file: File): boolean => {
  const heicTypes = ['image/heic', 'image/heif'];
  const extension = file.name.toLowerCase();
  
  return heicTypes.includes(file.type.toLowerCase()) || 
         extension.endsWith('.heic') || 
         extension.endsWith('.heif');
};

/**
 * Convierte un archivo HEIC/HEIF a JPEG
 */
export const convertHEICToJPEG = async (file: File): Promise<ConversionResult> => {
  console.log('📸 heicConverter: Procesando archivo:', {
    name: file.name,
    type: file.type,
    size: Math.round(file.size / 1024) + 'KB'
  });

  // Si no es HEIC, devolver el archivo original
  if (!isHEICFile(file)) {
    console.log('📸 heicConverter: No es archivo HEIC, sin conversión necesaria');
    return {
      convertedFile: file,
      wasConverted: false,
      originalFormat: file.type
    };
  }

  try {
    console.log('🔄 heicConverter: Convirtiendo HEIC a JPEG...');
    
    // Convertir HEIC a JPEG usando heic2any
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.8 // Calidad del JPEG resultante
    }) as Blob;

    // Crear un nuevo File desde el Blob convertido
    const convertedFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    const convertedFile = new File([convertedBlob], convertedFileName, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    console.log('✅ heicConverter: Conversión completada:', {
      originalSize: Math.round(file.size / 1024) + 'KB',
      convertedSize: Math.round(convertedFile.size / 1024) + 'KB',
      originalName: file.name,
      convertedName: convertedFileName
    });

    return {
      convertedFile,
      wasConverted: true,
      originalFormat: file.type || 'image/heic'
    };

  } catch (error) {
    console.error('❌ heicConverter: Error convirtiendo HEIC:', error);
    throw new Error('No se pudo convertir la imagen HEIC. Intenta usar un formato JPEG o PNG.');
  }
};

/**
 * Procesa un archivo, convirtiéndolo si es necesario
 */
export const processImageFile = async (file: File): Promise<ConversionResult> => {
  if (isHEICFile(file)) {
    return await convertHEICToJPEG(file);
  }
  
  return {
    convertedFile: file,
    wasConverted: false,
    originalFormat: file.type
  };
};
