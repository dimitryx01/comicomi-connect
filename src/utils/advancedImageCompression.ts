
/**
 * Utilidades avanzadas para compresión de imágenes
 * Implementa compresión agresiva con formatos modernos (WebP, AVIF)
 */

import imageCompression from 'browser-image-compression';

interface AdvancedCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  maxSizeMB?: number;
  useWebWorker?: boolean;
}

/**
 * Detecta soporte para formatos modernos en el navegador
 */
const checkFormatSupport = (): Promise<{ webp: boolean; avif: boolean }> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve({ webp: false, avif: false });
      return;
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1, 1);

    const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    // AVIF support check (más complejo)
    const img = new Image();
    img.onload = () => resolve({ webp: webpSupported, avif: true });
    img.onerror = () => resolve({ webp: webpSupported, avif: false });
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
};

/**
 * Compresión avanzada con soporte para formatos modernos
 */
export const advancedImageCompression = async (
  file: File,
  options: AdvancedCompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    maxSizeMB = 1, // Máximo 1MB por defecto
    useWebWorker = true
  } = options;

  console.log('🚀 advancedImageCompression: Iniciando compresión avanzada:', {
    originalSize: file.size,
    originalType: file.type,
    targetFormat: options.format,
    maxSizeMB
  });

  try {
    // Detectar soporte de formatos
    const formatSupport = await checkFormatSupport();
    console.log('📱 advancedImageCompression: Soporte de formatos:', formatSupport);

    // Determinar el mejor formato disponible
    let targetFormat = options.format;
    if (!targetFormat) {
      if (formatSupport.avif) {
        targetFormat = 'avif';
      } else if (formatSupport.webp) {
        targetFormat = 'webp';
      } else {
        targetFormat = 'jpeg';
      }
    }

    // Configuración de compresión agresiva
    const compressionOptions = {
      maxSizeMB,
      maxWidthOrHeight: Math.min(maxWidth, maxHeight),
      useWebWorker,
      quality,
      fileType: `image/${targetFormat}` as const,
      initialQuality: quality,
      alwaysKeepResolution: false,
      // Configuraciones adicionales para compresión agresiva
      maxIteration: 10, // Múltiples iteraciones para mejor compresión
      exifOrientation: 1, // Normalizar orientación
    };

    console.log('⚙️ advancedImageCompression: Configuración de compresión:', compressionOptions);

    // Aplicar compresión
    const compressedFile = await imageCompression(file, compressionOptions);

    const compressionRatio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);
    
    console.log('✅ advancedImageCompression: Compresión completada:', {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: `${compressionRatio}%`,
      finalFormat: compressedFile.type,
      finalName: compressedFile.name
    });

    // Crear un nuevo archivo con nombre actualizado para reflejar el formato
    const fileExtension = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
    const newFileName = file.name.replace(/\.[^/.]+$/, `.${fileExtension}`);
    
    return new File([compressedFile], newFileName, {
      type: compressedFile.type,
      lastModified: Date.now()
    });

  } catch (error) {
    console.error('❌ advancedImageCompression: Error durante la compresión:', error);
    
    // Fallback a compresión básica si falla la avanzada
    console.log('🔄 advancedImageCompression: Aplicando fallback a compresión básica...');
    
    const basicOptions = {
      maxSizeMB: maxSizeMB * 2, // Menos agresivo en el fallback
      maxWidthOrHeight: Math.min(maxWidth, maxHeight),
      useWebWorker: false,
      quality: quality + 0.1, // Calidad ligeramente mayor
    };

    try {
      const fallbackCompressed = await imageCompression(file, basicOptions);
      console.log('✅ advancedImageCompression: Fallback exitoso');
      return fallbackCompressed;
    } catch (fallbackError) {
      console.error('❌ advancedImageCompression: Fallback también falló:', fallbackError);
      throw new Error('Error en compresión de imagen: No se pudo comprimir el archivo');
    }
  }
};

/**
 * Compresión específica para avatares (formato cuadrado, alta compresión)
 */
export const compressAvatarImage = async (file: File): Promise<File> => {
  return advancedImageCompression(file, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.75,
    maxSizeMB: 0.5, // Máximo 500KB para avatares
    format: 'webp', // Preferir WebP para avatares
    useWebWorker: true
  });
};

/**
 * Compresión para imágenes de posts (balance entre calidad y tamaño)
 */
export const compressPostImage = async (file: File): Promise<File> => {
  return advancedImageCompression(file, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
    maxSizeMB: 2, // Máximo 2MB para posts
    useWebWorker: true
  });
};
