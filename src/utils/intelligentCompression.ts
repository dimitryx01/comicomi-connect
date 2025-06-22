
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
        console.log('🖼️ intelligentCompression: Procesando imagen:', {
          originalWidth: img.width,
          originalHeight: img.height,
          maxWidth: limits.maxWidth,
          maxHeight: limits.maxHeight
        });

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

        console.log('🎯 intelligentCompression: Dimensiones finales:', {
          finalWidth: canvas.width,
          finalHeight: canvas.height,
          reduction: Math.round((1 - (canvas.width * canvas.height) / (img.width * img.height)) * 100) + '%'
        });

        // Intentar diferentes niveles de calidad hasta encontrar el óptimo
        const qualityLevels = [0.9, 0.8, 0.7, 0.65, limits.minQuality];
        let bestBlob: Blob | null = null;
        let bestQuality = 0;
        
        for (const quality of qualityLevels) {
          try {
            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob(resolve, 'image/webp', quality);
            });

            if (blob) {
              const sizeKB = blob.size / 1024;
              
              console.log('🗜️ intelligentCompression: Probando calidad:', {
                quality,
                resultSizeKB: Math.round(sizeKB),
                targetKB: limits.targetSizeKB,
                maxKB: limits.maxSizeKB,
                withinTarget: sizeKB <= limits.targetSizeKB,
                withinLimit: sizeKB <= limits.maxSizeKB
              });

              // Si alcanzamos el objetivo, usar este resultado
              if (sizeKB <= limits.targetSizeKB) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/webp',
                  lastModified: Date.now()
                });
                
                console.log('✅ intelligentCompression: Objetivo alcanzado con calidad:', quality);
                resolve(compressedFile);
                return;
              }
              
              // Si está dentro del límite máximo, guardarlo como mejor opción
              if (sizeKB <= limits.maxSizeKB && (!bestBlob || quality > bestQuality)) {
                bestBlob = blob;
                bestQuality = quality;
              }
            }
          } catch (qualityError) {
            console.warn('⚠️ intelligentCompression: Error con calidad', quality, ':', qualityError);
          }
        }

        // Si tenemos una opción dentro del límite máximo, usarla
        if (bestBlob) {
          const compressedFile = new File([bestBlob], file.name, {
            type: 'image/webp',
            lastModified: Date.now()
          });
          
          console.log('✅ intelligentCompression: Usando mejor opción disponible:', {
            quality: bestQuality,
            finalSizeKB: Math.round(bestBlob.size / 1024),
            withinLimit: true
          });
          
          resolve(compressedFile);
          return;
        }

        // Si no pudimos comprimir dentro del límite, rechazar con detalles
        const finalSizeEstimate = Math.round((canvas.width * canvas.height * 3) / 1024); // Estimación RGB
        
        console.error('❌ intelligentCompression: No se pudo comprimir dentro del límite:', {
          fileName: file.name,
          originalSizeKB: Math.round(file.size / 1024),
          limitKB: limits.maxSizeKB,
          estimatedMinSizeKB: finalSizeEstimate,
          dimensionsReduced: canvas.width < img.width || canvas.height < img.height,
          qualitiesAttempted: qualityLevels.length
        });
        
        reject(new Error(
          `No se pudo comprimir "${file.name}" dentro del límite de ${limits.maxSizeKB}KB. ` +
          `Tamaño original: ${Math.round(file.size / 1024)}KB. ` +
          `Incluso con máxima compresión, el archivo seguiría siendo demasiado grande. ` +
          `Intenta usar una imagen más pequeña o de menor resolución.`
        ));
        
      } catch (error) {
        console.error('❌ intelligentCompression: Error procesando imagen:', {
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Error desconocido',
          imageWidth: img.width,
          imageHeight: img.height
        });
        reject(error);
      }
    };

    img.onerror = (error) => {
      console.error('❌ intelligentCompression: Error cargando imagen:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        error
      });
      reject(new Error(`Error cargando imagen "${file.name}". Verifica que el archivo sea una imagen válida.`));
    };

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
    fileType: file.type,
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

  // Verificar si el archivo excede límites razonables para compresión
  const maxAllowedForCompression = limits.maxSizeKB * 5; // 5x el límite como máximo procesable
  if (originalSizeKB > maxAllowedForCompression) {
    const errorMessage = `Archivo "${file.name}" demasiado grande (${Math.round(originalSizeKB)}KB). ` +
      `Para ${type === 'avatar' ? 'avatares' : 'medios'}, el tamaño máximo procesable es ${maxAllowedForCompression}KB. ` +
      `Usa una imagen más pequeña antes de subirla.`;
    
    console.error('❌ intelligentCompression: Archivo excede límites procesables:', {
      fileName: file.name,
      originalSizeKB: Math.round(originalSizeKB),
      maxProcessableKB: maxAllowedForCompression,
      type
    });
    
    throw new Error(errorMessage);
  }

  try {
    // Solo comprimir imágenes
    if (!file.type.startsWith('image/')) {
      console.log('⚠️ intelligentCompression: Archivo no es imagen, validando tamaño:', {
        fileName: file.name,
        fileType: file.type,
        sizeKB: Math.round(originalSizeKB),
        maxAllowedKB: limits.maxSizeKB
      });
      
      if (originalSizeKB > limits.maxSizeKB) {
        throw new Error(
          `El archivo "${file.name}" (${Math.round(originalSizeKB)}KB) no es una imagen y excede el límite de ${limits.maxSizeKB}KB. ` +
          `Los archivos que no son imágenes deben ser más pequeños.`
        );
      }
      
      return {
        file,
        wasCompressed: false,
        originalSizeKB: Math.round(originalSizeKB),
        finalSizeKB: Math.round(originalSizeKB),
        compressionRatio: 0,
        reason: 'Archivo no es imagen, dentro de límites'
      };
    }

    console.log('🗜️ intelligentCompression: Iniciando compresión progresiva...');
    
    // Aplicar compresión progresiva
    const compressedFile = await compressImageProgressively(file, limits);
    const finalSizeKB = compressedFile.size / 1024;
    const compressionRatio = Math.round((1 - compressedFile.size / file.size) * 100);

    // Verificar que la compresión fue efectiva
    if (compressedFile.size >= file.size) {
      console.log('⚠️ intelligentCompression: Compresión no redujo tamaño, evaluando alternativas:', {
        originalSizeKB: Math.round(originalSizeKB),
        compressedSizeKB: Math.round(finalSizeKB),
        withinOriginalLimits: originalSizeKB <= limits.maxSizeKB
      });
      
      if (originalSizeKB <= limits.maxSizeKB) {
        return {
          file,
          wasCompressed: false,
          originalSizeKB: Math.round(originalSizeKB),
          finalSizeKB: Math.round(originalSizeKB),
          compressionRatio: 0,
          reason: 'Compresión no efectiva, usando original dentro de límites'
        };
      } else {
        throw new Error(
          `No se pudo reducir el tamaño de "${file.name}". ` +
          `Tamaño actual: ${Math.round(originalSizeKB)}KB, límite: ${limits.maxSizeKB}KB. ` +
          `Intenta usar una imagen de menor resolución o calidad.`
        );
      }
    }

    // Verificar que el resultado final cumple los límites
    if (finalSizeKB > limits.maxSizeKB) {
      console.error('❌ intelligentCompression: Resultado de compresión aún excede límites:', {
        fileName: file.name,
        originalSizeKB: Math.round(originalSizeKB),
        compressedSizeKB: Math.round(finalSizeKB),
        limitKB: limits.maxSizeKB,
        compressionRatio: `${compressionRatio}%`
      });
      
      throw new Error(
        `Archivo "${file.name}" no se pudo comprimir suficientemente. ` +
        `Resultado: ${Math.round(finalSizeKB)}KB, límite: ${limits.maxSizeKB}KB. ` +
        `Reducción lograda: ${compressionRatio}%. ` +
        `Usa una imagen de menor resolución.`
      );
    }

    console.log('✅ intelligentCompression: Compresión exitosa:', {
      fileName: file.name,
      originalSizeKB: Math.round(originalSizeKB),
      finalSizeKB: Math.round(finalSizeKB),
      compressionRatio: `${compressionRatio}%`,
      savings: `${Math.round(originalSizeKB - finalSizeKB)}KB`,
      withinLimits: finalSizeKB <= limits.maxSizeKB
    });

    return {
      file: compressedFile,
      wasCompressed: true,
      originalSizeKB: Math.round(originalSizeKB),
      finalSizeKB: Math.round(finalSizeKB),
      compressionRatio,
      reason: `Compresión exitosa: ${compressionRatio}% de reducción`
    };

  } catch (error) {
    console.error('❌ intelligentCompression: Error crítico en compresión:', {
      fileName: file.name,
      originalSizeKB: Math.round(originalSizeKB),
      type,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Re-lanzar el error con contexto adicional si es necesario
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Error inesperado comprimiendo "${file.name}". Intenta con otro archivo.`);
    }
  }
};

/**
 * Valida que un archivo cumple con los límites antes de procesamiento
 */
export const validateFileLimits = (file: File, type: 'avatar' | 'media'): { valid: boolean; error?: string } => {
  const limits = COMPRESSION_LIMITS[type];
  const fileSizeKB = file.size / 1024;
  const maxProcessableKB = limits.maxSizeKB * 5;

  console.log('🔍 intelligentCompression: Validando límites de archivo:', {
    fileName: file.name,
    sizeKB: Math.round(fileSizeKB),
    type,
    maxProcessableKB,
    maxFinalKB: limits.maxSizeKB
  });

  // Verificar tamaño máximo procesable
  if (fileSizeKB > maxProcessableKB) {
    const errorMessage = `Archivo "${file.name}" demasiado grande (${Math.round(fileSizeKB)}KB). ` +
      `Máximo procesable para ${type === 'avatar' ? 'avatares' : 'medios'}: ${maxProcessableKB}KB. ` +
      `Reduce el tamaño del archivo antes de subirlo.`;
    
    return { valid: false, error: errorMessage };
  }

  // Verificar tipo de archivo para imágenes
  if (file.type.startsWith('image/')) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Formato "${file.type}" no soportado. Usa JPG, PNG o WebP.`
      };
    }
  }

  console.log('✅ intelligentCompression: Archivo válido para procesamiento');
  return { valid: true };
};
