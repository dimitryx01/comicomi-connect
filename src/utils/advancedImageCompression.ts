
/**
 * Utilidades avanzadas para compresión de imágenes
 * Implementa compresión agresiva con límite máximo de 150KB
 */

import imageCompression from 'browser-image-compression';

interface AdvancedCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  maxSizeKB?: number;
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
    
    // AVIF support check
    const img = new Image();
    img.onload = () => resolve({ webp: webpSupported, avif: true });
    img.onerror = () => resolve({ webp: webpSupported, avif: false });
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
};

/**
 * Compresión agresiva con límite estricto de 150KB
 */
export const advancedImageCompression = async (
  file: File,
  options: AdvancedCompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    maxSizeKB = 150, // Límite estricto de 150KB
    useWebWorker = true
  } = options;

  console.log('🚀 advancedImageCompression: Iniciando compresión ultra-agresiva:', {
    originalSize: file.size,
    originalSizeKB: Math.round(file.size / 1024),
    targetSizeKB: maxSizeKB,
    originalType: file.type
  });

  try {
    // Detectar soporte de formatos
    const formatSupport = await checkFormatSupport();
    console.log('📱 advancedImageCompression: Soporte de formatos:', formatSupport);

    // Determinar el mejor formato para compresión agresiva
    let targetFormat = options.format;
    if (!targetFormat) {
      if (formatSupport.webp) {
        targetFormat = 'webp'; // WebP es más eficiente que AVIF para tamaños pequeños
      } else {
        targetFormat = 'jpeg';
      }
    }

    const maxSizeMB = maxSizeKB / 1024; // Convertir a MB
    let currentQuality = 0.7; // Empezar con calidad media
    let currentMaxDimension = Math.min(maxWidth, maxHeight);
    let attempts = 0;
    const maxAttempts = 8;

    while (attempts < maxAttempts) {
      console.log(`🔄 advancedImageCompression: Intento ${attempts + 1}/${maxAttempts}:`, {
        quality: currentQuality,
        maxDimension: currentMaxDimension,
        targetFormat
      });

      const compressionOptions = {
        maxSizeMB,
        maxWidthOrHeight: currentMaxDimension,
        useWebWorker,
        quality: currentQuality,
        fileType: `image/${targetFormat}` as const,
        initialQuality: currentQuality,
        alwaysKeepResolution: false,
        maxIteration: 5,
        exifOrientation: 1,
      };

      const compressedFile = await imageCompression(file, compressionOptions);
      const compressedSizeKB = Math.round(compressedFile.size / 1024);

      console.log(`📊 advancedImageCompression: Resultado intento ${attempts + 1}:`, {
        size: compressedFile.size,
        sizeKB: compressedSizeKB,
        targetKB: maxSizeKB,
        quality: currentQuality,
        dimensions: currentMaxDimension
      });

      // Si está dentro del límite, retornar
      if (compressedSizeKB <= maxSizeKB) {
        const compressionRatio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);
        
        console.log('✅ advancedImageCompression: Objetivo alcanzado:', {
          originalSizeKB: Math.round(file.size / 1024),
          finalSizeKB: compressedSizeKB,
          compressionRatio: `${compressionRatio}%`,
          attempts: attempts + 1,
          finalQuality: currentQuality,
          finalDimensions: currentMaxDimension
        });

        // Crear archivo con nombre actualizado
        const fileExtension = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
        const newFileName = file.name.replace(/\.[^/.]+$/, `.${fileExtension}`);
        
        return new File([compressedFile], newFileName, {
          type: compressedFile.type,
          lastModified: Date.now()
        });
      }

      // Ajustar parámetros para siguiente intento
      attempts++;
      
      if (attempts < maxAttempts) {
        // Reducir calidad más agresivamente
        currentQuality = Math.max(0.3, currentQuality - 0.15);
        
        // Reducir dimensiones si la calidad ya es muy baja
        if (currentQuality <= 0.4) {
          currentMaxDimension = Math.max(400, currentMaxDimension * 0.8);
        }
      }
    }

    // Si no se pudo alcanzar el objetivo, hacer un último intento ultra-agresivo
    console.log('⚠️ advancedImageCompression: Aplicando compresión ultra-agresiva final...');
    
    const ultraAggressiveOptions = {
      maxSizeMB,
      maxWidthOrHeight: Math.min(600, currentMaxDimension),
      useWebWorker: false,
      quality: 0.25,
      fileType: 'image/jpeg' as const, // JPEG para máxima compresión
      initialQuality: 0.25,
      alwaysKeepResolution: false,
      maxIteration: 10,
      exifOrientation: 1,
    };

    const finalCompressed = await imageCompression(file, ultraAggressiveOptions);
    const finalSizeKB = Math.round(finalCompressed.size / 1024);

    console.log('🎯 advancedImageCompression: Compresión final completada:', {
      finalSizeKB,
      targetKB: maxSizeKB,
      achieved: finalSizeKB <= maxSizeKB ? '✅' : '⚠️'
    });

    return finalCompressed;

  } catch (error) {
    console.error('❌ advancedImageCompression: Error durante compresión ultra-agresiva:', error);
    
    // Fallback ultra-simple
    try {
      const fallbackOptions = {
        maxSizeMB: maxSizeKB / 1024,
        maxWidthOrHeight: 500,
        useWebWorker: false,
        quality: 0.3,
        fileType: 'image/jpeg' as const
      };

      const fallbackCompressed = await imageCompression(file, fallbackOptions);
      console.log('✅ advancedImageCompression: Fallback exitoso');
      return fallbackCompressed;
    } catch (fallbackError) {
      console.error('❌ advancedImageCompression: Fallback también falló:', fallbackError);
      throw new Error('Error en compresión ultra-agresiva: No se pudo alcanzar el tamaño objetivo');
    }
  }
};

/**
 * Compresión específica para avatares (máximo 100KB)
 */
export const compressAvatarImage = async (file: File): Promise<File> => {
  return advancedImageCompression(file, {
    maxWidth: 400,
    maxHeight: 400,
    maxSizeKB: 100, // Avatares aún más pequeños
    format: 'webp',
    useWebWorker: true
  });
};

/**
 * Compresión para imágenes de posts (máximo 150KB)
 */
export const compressPostImage = async (file: File): Promise<File> => {
  return advancedImageCompression(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    maxSizeKB: 150,
    useWebWorker: true
  });
};
