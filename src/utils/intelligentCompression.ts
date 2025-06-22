
/**
 * Sistema de compresión inteligente con límites estrictos
 * Optimiza archivos solo cuando es necesario, respetando límites de tamaño
 */

interface CompressionLimits {
  maxSizeKB: number;
  targetSizeKB: number;
  minQuality: number;
  maxWidth: number;
  maxHeight: number;
}

interface CompressionResult {
  file: File;
  wasCompressed: boolean;
  originalSizeKB: number;
  finalSizeKB: number;
  compressionRatio: number;
  reason: string;
}

// Límites específicos por tipo de archivo
const COMPRESSION_LIMITS: Record<string, CompressionLimits> = {
  avatar: {
    maxSizeKB: 80,      // Límite estricto
    targetSizeKB: 65,   // Objetivo con margen de seguridad
    minQuality: 0.6,    // Calidad mínima aceptable
    maxWidth: 400,
    maxHeight: 400
  },
  media: {
    maxSizeKB: 150,     // Límite estricto
    targetSizeKB: 125,  // Objetivo con margen de seguridad
    minQuality: 0.7,    // Calidad mínima aceptable
    maxWidth: 1200,
    maxHeight: 1200
  }
};

/**
 * Determina si un archivo necesita compresión
 */
const needsCompression = (file: File, type: 'avatar' | 'media'): boolean => {
  const limits = COMPRESSION_LIMITS[type];
  const fileSizeKB = file.size / 1024;
  
  console.log('🔍 intelligentCompression: Evaluando necesidad de compresión:', {
    fileName: file.name,
    currentSizeKB: Math.round(fileSizeKB),
    maxAllowedKB: limits.maxSizeKB,
    targetKB: limits.targetSizeKB,
    needsCompression: fileSizeKB > limits.targetSizeKB
  });
  
  // Solo comprimir si excede el objetivo o si es mucho mayor que el límite
  return fileSizeKB > limits.targetSizeKB;
};

/**
 * Comprime una imagen usando Canvas con configuración progresiva
 */
const compressImageProgressively = async (
  file: File,
  limits: CompressionLimits
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = async () => {
      try {
        // Calcular dimensiones respetando límites
        let { width, height } = img;
        
        if (width > limits.maxWidth) {
          height = (height * limits.maxWidth) / width;
          width = limits.maxWidth;
        }
        
        if (height > limits.maxHeight) {
          width = (width * limits.maxHeight) / height;
          height = limits.maxHeight;
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Intentar diferentes niveles de calidad hasta encontrar el óptimo
        const qualityLevels = [0.9, 0.8, 0.7, 0.65, limits.minQuality];
        
        for (const quality of qualityLevels) {
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/webp', quality);
          });

          if (blob) {
            const sizeKB = blob.size / 1024;
            
            console.log('🗜️ intelligentCompression: Probando calidad:', {
              quality,
              resultSizeKB: Math.round(sizeKB),
              targetKB: limits.targetSizeKB,
              withinLimit: sizeKB <= limits.maxSizeKB
            });

            // Si alcanzamos el objetivo o estamos dentro del límite, usar este resultado
            if (sizeKB <= limits.targetSizeKB || sizeKB <= limits.maxSizeKB) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/webp',
                lastModified: Date.now()
              });
              
              resolve(compressedFile);
              return;
            }
          }
        }

        // Si no pudimos comprimir dentro de los límites, rechazar
        reject(new Error(`No se pudo comprimir ${file.name} dentro del límite de ${limits.maxSizeKB}KB`));
        
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Error cargando imagen para compresión'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Aplica compresión inteligente a un archivo
 */
export const applyIntelligentCompression = async (
  file: File,
  type: 'avatar' | 'media'
): Promise<CompressionResult> => {
  const originalSizeKB = file.size / 1024;
  const limits = COMPRESSION_LIMITS[type];

  console.log('🎯 intelligentCompression: Iniciando compresión inteligente:', {
    fileName: file.name,
    type,
    originalSizeKB: Math.round(originalSizeKB),
    limits
  });

  // Verificar si el archivo ya está dentro de los límites
  if (!needsCompression(file, type)) {
    console.log('✅ intelligentCompression: Archivo ya optimizado, no requiere compresión');
    
    return {
      file,
      wasCompressed: false,
      originalSizeKB: Math.round(originalSizeKB),
      finalSizeKB: Math.round(originalSizeKB),
      compressionRatio: 0,
      reason: 'Archivo ya optimizado dentro de límites'
    };
  }

  // Verificar si el archivo excede el límite máximo absoluto
  if (originalSizeKB > limits.maxSizeKB * 2) {
    throw new Error(`Archivo demasiado grande (${Math.round(originalSizeKB)}KB). Máximo permitido: ${limits.maxSizeKB}KB`);
  }

  try {
    // Solo comprimir imágenes
    if (!file.type.startsWith('image/')) {
      console.log('⚠️ intelligentCompression: Archivo no es imagen, sin compresión');
      
      if (originalSizeKB > limits.maxSizeKB) {
        throw new Error(`Archivo no es imagen y excede ${limits.maxSizeKB}KB`);
      }
      
      return {
        file,
        wasCompressed: false,
        originalSizeKB: Math.round(originalSizeKB),
        finalSizeKB: Math.round(originalSizeKB),
        compressionRatio: 0,
        reason: 'Archivo no es imagen'
      };
    }

    // Aplicar compresión progresiva
    const compressedFile = await compressImageProgressively(file, limits);
    const finalSizeKB = compressedFile.size / 1024;
    const compressionRatio = Math.round((1 - compressedFile.size / file.size) * 100);

    // Verificar que la compresión fue efectiva
    if (compressedFile.size >= file.size) {
      console.log('⚠️ intelligentCompression: Compresión no efectiva, usando archivo original');
      
      if (originalSizeKB <= limits.maxSizeKB) {
        return {
          file,
          wasCompressed: false,
          originalSizeKB: Math.round(originalSizeKB),
          finalSizeKB: Math.round(originalSizeKB),
          compressionRatio: 0,
          reason: 'Compresión no redujo tamaño'
        };
      } else {
        throw new Error(`No se pudo comprimir archivo dentro del límite de ${limits.maxSizeKB}KB`);
      }
    }

    // Verificar que el resultado final cumple los límites
    if (finalSizeKB > limits.maxSizeKB) {
      throw new Error(`Archivo comprimido (${Math.round(finalSizeKB)}KB) aún excede el límite de ${limits.maxSizeKB}KB`);
    }

    console.log('✅ intelligentCompression: Compresión exitosa:', {
      originalSizeKB: Math.round(originalSizeKB),
      finalSizeKB: Math.round(finalSizeKB),
      compressionRatio: `${compressionRatio}%`,
      withinLimits: finalSizeKB <= limits.maxSizeKB
    });

    return {
      file: compressedFile,
      wasCompressed: true,
      originalSizeKB: Math.round(originalSizeKB),
      finalSizeKB: Math.round(finalSizeKB),
      compressionRatio,
      reason: 'Compresión aplicada exitosamente'
    };

  } catch (error) {
    console.error('❌ intelligentCompression: Error en compresión:', error);
    throw error;
  }
};

/**
 * Valida que un archivo cumple con los límites antes de procesamiento
 */
export const validateFileLimits = (file: File, type: 'avatar' | 'media'): { valid: boolean; error?: string } => {
  const limits = COMPRESSION_LIMITS[type];
  const fileSizeKB = file.size / 1024;

  // Verificar tamaño máximo absoluto (permitir hasta 2x el límite para compresión)
  if (fileSizeKB > limits.maxSizeKB * 2) {
    return {
      valid: false,
      error: `Archivo demasiado grande (${Math.round(fileSizeKB)}KB). Máximo permitido: ${limits.maxSizeKB}KB`
    };
  }

  // Verificar tipo de archivo para imágenes
  if (file.type.startsWith('image/')) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato de imagen no soportado. Use JPG, PNG o WebP'
      };
    }
  }

  return { valid: true };
};
