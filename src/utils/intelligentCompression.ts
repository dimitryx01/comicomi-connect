
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
    targetSizeKB: 70,   // Objetivo con margen de seguridad
    minQuality: 0.5,    // Calidad mínima aceptable (más agresiva)
    maxWidth: 400,
    maxHeight: 400
  },
  media: {
    maxSizeKB: 150,     // Límite estricto
    targetSizeKB: 130,  // Objetivo con margen de seguridad
    minQuality: 0.6,    // Calidad mínima aceptable
    maxWidth: 1200,
    maxHeight: 1200
  }
};

/**
 * Comprime una imagen usando Canvas con configuración progresiva muy agresiva
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
        console.log('🖼️ intelligentCompression: Procesando imagen con compresión obligatoria:', {
          originalWidth: img.width,
          originalHeight: img.height,
          maxWidth: limits.maxWidth,
          maxHeight: limits.maxHeight,
          originalSizeKB: Math.round(file.size / 1024)
        });

        // Calcular dimensiones respetando límites (más agresivo)
        let { width, height } = img;
        
        // Reducir dimensiones de forma más agresiva si es necesario
        const aspectRatio = width / height;
        
        if (width > limits.maxWidth || height > limits.maxHeight) {
          if (aspectRatio > 1) {
            // Imagen horizontal
            width = Math.min(width, limits.maxWidth);
            height = width / aspectRatio;
            if (height > limits.maxHeight) {
              height = limits.maxHeight;
              width = height * aspectRatio;
            }
          } else {
            // Imagen vertical o cuadrada
            height = Math.min(height, limits.maxHeight);
            width = height * aspectRatio;
            if (width > limits.maxWidth) {
              width = limits.maxWidth;
              height = width / aspectRatio;
            }
          }
        }

        // Si el archivo es muy grande, reducir dimensiones aún más
        const originalSizeKB = file.size / 1024;
        if (originalSizeKB > limits.maxSizeKB * 3) {
          const reductionFactor = Math.sqrt(limits.maxSizeKB / originalSizeKB);
          width = Math.floor(width * reductionFactor);
          height = Math.floor(height * reductionFactor);
          
          console.log('🔧 intelligentCompression: Reducción adicional de dimensiones por tamaño:', {
            reductionFactor: Math.round(reductionFactor * 100) / 100,
            newWidth: width,
            newHeight: height
          });
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        console.log('🎯 intelligentCompression: Dimensiones finales:', {
          finalWidth: canvas.width,
          finalHeight: canvas.height,
          pixelReduction: Math.round((1 - (canvas.width * canvas.height) / (img.width * img.height)) * 100) + '%'
        });

        // Intentar diferentes niveles de calidad de forma más agresiva
        const qualityLevels = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, limits.minQuality];
        let bestResult: { blob: Blob; quality: number } | null = null;
        
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
              if (sizeKB <= limits.maxSizeKB) {
                bestResult = { blob, quality };
              }
            }
          } catch (qualityError) {
            console.warn('⚠️ intelligentCompression: Error con calidad', quality, ':', qualityError);
          }
        }

        // Si tenemos una opción dentro del límite máximo, usarla
        if (bestResult) {
          const compressedFile = new File([bestResult.blob], file.name, {
            type: 'image/webp',
            lastModified: Date.now()
          });
          
          console.log('✅ intelligentCompression: Usando mejor opción disponible:', {
            quality: bestResult.quality,
            finalSizeKB: Math.round(bestResult.blob.size / 1024),
            withinLimit: true
          });
          
          resolve(compressedFile);
          return;
        }

        // Si no pudimos comprimir dentro del límite, intentar con JPEG como fallback
        console.log('🔄 intelligentCompression: Intentando fallback con JPEG...');
        
        for (const quality of [0.7, 0.6, 0.5, 0.4, 0.3, 0.2]) {
          try {
            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob(resolve, 'image/jpeg', quality);
            });

            if (blob && blob.size / 1024 <= limits.maxSizeKB) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              console.log('✅ intelligentCompression: Fallback JPEG exitoso:', {
                quality,
                finalSizeKB: Math.round(blob.size / 1024)
              });
              
              resolve(compressedFile);
              return;
            }
          } catch (error) {
            console.warn('⚠️ intelligentCompression: Error en fallback JPEG:', error);
          }
        }

        // Si aún no pudimos comprimir, rechazar con detalles
        const finalSizeEstimate = Math.round((canvas.width * canvas.height * 3) / 1024);
        
        console.error('❌ intelligentCompression: No se pudo comprimir dentro del límite:', {
          fileName: file.name,
          originalSizeKB: Math.round(file.size / 1024),
          limitKB: limits.maxSizeKB,
          estimatedMinSizeKB: finalSizeEstimate,
          finalDimensions: `${canvas.width}x${canvas.height}`,
          originalDimensions: `${img.width}x${img.height}`
        });
        
        reject(new Error(
          `No se pudo comprimir "${file.name}" dentro del límite de ${limits.maxSizeKB}KB. ` +
          `Tamaño original: ${Math.round(file.size / 1024)}KB. ` +
          `Tamaño final estimado: ${finalSizeEstimate}KB. ` +
          `La imagen es demasiado compleja o tiene demasiada información para comprimir efectivamente. ` +
          `Intenta usar una imagen de menor resolución o con menos detalles.`
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
 * Aplica compresión inteligente OBLIGATORIA a un archivo
 */
export const applyIntelligentCompression = async (
  file: File,
  type: 'avatar' | 'media'
): Promise<CompressionResult> => {
  const originalSizeKB = file.size / 1024;
  const limits = COMPRESSION_LIMITS[type];

  console.log('🎯 intelligentCompression: Iniciando compresión inteligente OBLIGATORIA:', {
    fileName: file.name,
    type,
    originalSizeKB: Math.round(originalSizeKB),
    fileType: file.type,
    limits
  });

  try {
    // Solo comprimir imágenes, otros tipos de archivo no se procesan
    if (!file.type.startsWith('image/')) {
      console.log('⚠️ intelligentCompression: Archivo no es imagen, validando tamaño:', {
        fileName: file.name,
        fileType: file.type,
        sizeKB: Math.round(originalSizeKB),
        maxAllowedKB: limits.maxSizeKB
      });
      
      // Para archivos que no son imágenes, rechazar si exceden el límite
      if (originalSizeKB > limits.maxSizeKB) {
        throw new Error(
          `El archivo "${file.name}" (${Math.round(originalSizeKB)}KB) no es una imagen y excede el límite de ${limits.maxSizeKB}KB. ` +
          `Los archivos que no son imágenes deben ser más pequeños o usar formatos de imagen.`
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

    console.log('🗜️ intelligentCompression: Aplicando compresión progresiva obligatoria...');
    
    // Aplicar compresión progresiva SIEMPRE
    const compressedFile = await compressImageProgressively(file, limits);
    const finalSizeKB = compressedFile.size / 1024;
    const compressionRatio = Math.round((1 - compressedFile.size / file.size) * 100);

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
        `La imagen contiene demasiada información para comprimir efectivamente dentro del límite.`
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
      reason: `Compresión obligatoria exitosa: ${compressionRatio}% de reducción`
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
 * Valida que un archivo cumple SOLO con el límite de 9MB antes de procesamiento
 */
export const validateFileLimits = (file: File, type: 'avatar' | 'media'): { valid: boolean; error?: string } => {
  const fileSizeMB = file.size / (1024 * 1024);
  const maxUploadSizeMB = 9;

  console.log('🔍 intelligentCompression: Validando límite de 9MB:', {
    fileName: file.name,
    sizeMB: Math.round(fileSizeMB * 100) / 100,
    type,
    maxUploadSizeMB,
    withinLimit: fileSizeMB <= maxUploadSizeMB
  });

  // Solo verificar el límite de 9MB para subida
  if (fileSizeMB > maxUploadSizeMB) {
    const errorMessage = `Archivo "${file.name}" demasiado grande (${Math.round(fileSizeMB * 100) / 100}MB). ` +
      `Máximo permitido para subida: ${maxUploadSizeMB}MB. ` +
      `Reduce el tamaño del archivo antes de subirlo.`;
    
    return { valid: false, error: errorMessage };
  }

  // Verificar tipo de archivo para imágenes (mantener validación básica)
  if (file.type.startsWith('image/')) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Formato "${file.type}" no soportado. Usa JPG, PNG, WebP o GIF.`
      };
    }
  }

  console.log('✅ intelligentCompression: Archivo válido para procesamiento (dentro de 9MB)');
  return { valid: true };
};
