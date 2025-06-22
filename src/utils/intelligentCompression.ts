
/**
 * Sistema de compresión inteligente con límites estrictos y optimización adaptativa
 * Optimiza archivos según características de la imagen original para maximizar calidad visual
 */

interface CompressionLimits {
  maxSizeKB: number;
  targetSizeKB: number;
  minQuality: number;
  maxWidth: number;
  maxHeight: number;
  standardDimension: number; // Dimensión estándar para recorte condicional
}

interface CompressionResult {
  file: File;
  wasCompressed: boolean;
  originalSizeKB: number;
  finalSizeKB: number;
  compressionRatio: number;
  reason: string;
}

interface ImageAnalysis {
  sizeCategory: 'small' | 'medium' | 'large';
  needsResize: boolean;
  suggestedQuality: number;
  compressionStrategy: 'gentle' | 'moderate' | 'aggressive';
}

// Límites específicos por tipo de archivo con dimensión estándar
const COMPRESSION_LIMITS: Record<string, CompressionLimits> = {
  avatar: {
    maxSizeKB: 80,      // Límite estricto
    targetSizeKB: 70,   // Objetivo con margen de seguridad
    minQuality: 0.4,    // Calidad mínima aceptable
    maxWidth: 400,
    maxHeight: 400,
    standardDimension: 1027 // Dimensión estándar para recorte condicional
  },
  media: {
    maxSizeKB: 150,     // Límite estricto
    targetSizeKB: 130,  // Objetivo con margen de seguridad
    minQuality: 0.5,    // Calidad mínima aceptable
    maxWidth: 1200,
    maxHeight: 1200,
    standardDimension: 1027 // Dimensión estándar para recorte condicional
  }
};

/**
 * Analiza las características de una imagen para determinar la estrategia de compresión óptima
 */
const analyzeImageForCompression = async (
  file: File,
  limits: CompressionLimits
): Promise<ImageAnalysis> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const originalSizeKB = file.size / 1024;
      const maxDimension = Math.max(img.width, img.height);
      
      // Categorizar por tamaño de archivo
      let sizeCategory: ImageAnalysis['sizeCategory'];
      if (originalSizeKB < limits.maxSizeKB * 0.5) {
        sizeCategory = 'small'; // Menos de la mitad del límite
      } else if (originalSizeKB < limits.maxSizeKB * 1.5) {
        sizeCategory = 'medium'; // Entre 0.5x y 1.5x el límite
      } else {
        sizeCategory = 'large'; // Más de 1.5x el límite
      }
      
      // Determinar si necesita redimensionamiento
      const needsResize = maxDimension > limits.standardDimension;
      
      // Sugerir calidad inicial basada en características
      let suggestedQuality: number;
      let compressionStrategy: ImageAnalysis['compressionStrategy'];
      
      if (sizeCategory === 'small' && !needsResize) {
        // Imagen pequeña y dimensiones adecuadas: compresión suave
        suggestedQuality = 0.85;
        compressionStrategy = 'gentle';
      } else if (sizeCategory === 'medium' || (sizeCategory === 'small' && needsResize)) {
        // Imagen mediana o pequeña que necesita recorte: compresión moderada
        suggestedQuality = 0.75;
        compressionStrategy = 'moderate';
      } else {
        // Imagen grande: compresión agresiva
        suggestedQuality = 0.65;
        compressionStrategy = 'aggressive';
      }
      
      console.log('🔍 intelligentCompression: Análisis de imagen completado:', {
        fileName: file.name,
        originalSizeKB: Math.round(originalSizeKB),
        dimensionsOriginal: `${img.width}x${img.height}`,
        maxDimension,
        standardDimension: limits.standardDimension,
        sizeCategory,
        needsResize,
        suggestedQuality,
        compressionStrategy
      });
      
      resolve({
        sizeCategory,
        needsResize,
        suggestedQuality,
        compressionStrategy
      });
    };
    
    img.onerror = () => {
      reject(new Error(`Error analizando imagen "${file.name}"`));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Comprime una imagen usando Canvas con estrategia adaptativa inteligente
 */
const compressImageIntelligently = async (
  file: File,
  limits: CompressionLimits,
  analysis: ImageAnalysis
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = async () => {
      try {
        console.log('🧠 intelligentCompression: Aplicando compresión adaptativa:', {
          fileName: file.name,
          strategy: analysis.compressionStrategy,
          needsResize: analysis.needsResize,
          suggestedQuality: analysis.suggestedQuality
        });

        let { width, height } = img;
        const aspectRatio = width / height;
        
        // Aplicar recorte condicional solo si es necesario
        if (analysis.needsResize) {
          const maxDimension = Math.max(width, height);
          const scaleFactor = limits.standardDimension / maxDimension;
          
          width = Math.floor(width * scaleFactor);
          height = Math.floor(height * scaleFactor);
          
          console.log('✂️ intelligentCompression: Aplicando recorte condicional:', {
            originalDimensions: `${img.width}x${img.height}`,
            newDimensions: `${width}x${height}`,
            scaleFactor: Math.round(scaleFactor * 100) / 100,
            standardDimension: limits.standardDimension
          });
        } else {
          console.log('📐 intelligentCompression: Manteniendo dimensiones originales (no requiere recorte)');
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Determinar niveles de calidad según estrategia
        let qualityLevels: number[];
        
        switch (analysis.compressionStrategy) {
          case 'gentle':
            // Compresión suave: mantener alta calidad
            qualityLevels = [analysis.suggestedQuality, 0.8, 0.75, 0.7, Math.max(0.6, limits.minQuality)];
            break;
          case 'moderate':
            // Compresión moderada: balance entre calidad y tamaño
            qualityLevels = [analysis.suggestedQuality, 0.7, 0.6, 0.55, Math.max(0.5, limits.minQuality)];
            break;
          case 'aggressive':
            // Compresión agresiva: priorizar reducción de tamaño
            qualityLevels = [analysis.suggestedQuality, 0.6, 0.5, 0.4, 0.35, limits.minQuality];
            break;
        }

        console.log('🎯 intelligentCompression: Probando niveles de calidad:', {
          strategy: analysis.compressionStrategy,
          qualityLevels,
          targetKB: limits.targetSizeKB,
          maxKB: limits.maxSizeKB
        });

        // Probar diferentes niveles de calidad progresivamente
        for (const quality of qualityLevels) {
          try {
            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob(resolve, 'image/webp', quality);
            });

            if (blob) {
              const sizeKB = blob.size / 1024;
              
              console.log('🔄 intelligentCompression: Resultado con calidad', quality + ':', {
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
                
                console.log('✅ intelligentCompression: Objetivo alcanzado con estrategia', analysis.compressionStrategy);
                resolve(compressedFile);
                return;
              }
              
              // Si está dentro del límite máximo pero no del objetivo, continuar buscando
              if (sizeKB <= limits.maxSizeKB && quality === qualityLevels[qualityLevels.length - 1]) {
                // Es la última calidad y está dentro del límite
                const compressedFile = new File([blob], file.name, {
                  type: 'image/webp',
                  lastModified: Date.now()
                });
                
                console.log('✅ intelligentCompression: Límite máximo respetado con última calidad disponible');
                resolve(compressedFile);
                return;
              }
            }
          } catch (error) {
            console.warn('⚠️ intelligentCompression: Error con calidad', quality, ':', error);
          }
        }

        // Si WebP no funcionó, intentar fallback con JPEG
        console.log('🔄 intelligentCompression: Intentando fallback JPEG...');
        
        const jpegQualityLevels = analysis.compressionStrategy === 'gentle' 
          ? [0.8, 0.7, 0.6, 0.5]
          : [0.6, 0.5, 0.4, 0.3];
        
        for (const quality of jpegQualityLevels) {
          try {
            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob(resolve, 'image/jpeg', quality);
            });

            if (blob && blob.size / 1024 <= limits.maxSizeKB) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              console.log('✅ intelligentCompression: Fallback JPEG exitoso con calidad:', quality);
              resolve(compressedFile);
              return;
            }
          } catch (error) {
            console.warn('⚠️ intelligentCompression: Error en fallback JPEG:', error);
          }
        }

        // Si no se pudo comprimir dentro del límite, rechazar con detalles específicos
        const currentStrategy = analysis.compressionStrategy;
        const finalSizeEstimate = Math.round((canvas.width * canvas.height * 3) / 1024);
        
        console.error('❌ intelligentCompression: Compresión inteligente fallida:', {
          fileName: file.name,
          originalSizeKB: Math.round(file.size / 1024),
          strategy: currentStrategy,
          finalDimensions: `${canvas.width}x${canvas.height}`,
          estimatedMinSizeKB: finalSizeEstimate,
          limitKB: limits.maxSizeKB,
          needsResize: analysis.needsResize
        });
        
        reject(new Error(
          `No se pudo comprimir "${file.name}" dentro del límite de ${limits.maxSizeKB}KB usando estrategia ${currentStrategy}. ` +
          `Tamaño original: ${Math.round(file.size / 1024)}KB. ` +
          `Dimensiones procesadas: ${canvas.width}x${canvas.height}. ` +
          `La imagen contiene demasiada información compleja para comprimir efectivamente. ` +
          `Intenta usar una imagen con menos detalles o de menor resolución inicial.`
        ));
        
      } catch (error) {
        console.error('❌ intelligentCompression: Error crítico en compresión adaptativa:', error);
        reject(error);
      }
    };

    img.onerror = (error) => {
      console.error('❌ intelligentCompression: Error cargando imagen para análisis:', error);
      reject(new Error(`Error cargando imagen "${file.name}" para compresión inteligente`));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Aplica compresión inteligente OBLIGATORIA con análisis adaptativo
 */
export const applyIntelligentCompression = async (
  file: File,
  type: 'avatar' | 'media'
): Promise<CompressionResult> => {
  const originalSizeKB = file.size / 1024;
  const limits = COMPRESSION_LIMITS[type];

  console.log('🚀 intelligentCompression: Iniciando compresión inteligente adaptativa:', {
    fileName: file.name,
    type,
    originalSizeKB: Math.round(originalSizeKB),
    fileType: file.type,
    limits: {
      maxKB: limits.maxSizeKB,
      targetKB: limits.targetSizeKB,
      standardDimension: limits.standardDimension
    }
  });

  try {
    // Solo comprimir imágenes
    if (!file.type.startsWith('image/')) {
      console.log('⚠️ intelligentCompression: Archivo no es imagen, validando tamaño únicamente');
      
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
        reason: 'Archivo no es imagen, dentro de límites sin procesamiento'
      };
    }

    // Analizar imagen para determinar estrategia óptima
    console.log('🔍 intelligentCompression: Analizando características de la imagen...');
    const analysis = await analyzeImageForCompression(file, limits);
    
    // Aplicar compresión inteligente basada en el análisis
    console.log('🎯 intelligentCompression: Aplicando compresión con estrategia:', analysis.compressionStrategy);
    const compressedFile = await compressImageIntelligently(file, limits, analysis);
    
    const finalSizeKB = compressedFile.size / 1024;
    const compressionRatio = Math.round((1 - compressedFile.size / file.size) * 100);

    // Verificar resultado final
    if (finalSizeKB > limits.maxSizeKB) {
      console.error('❌ intelligentCompression: Resultado final excede límites:', {
        finalSizeKB: Math.round(finalSizeKB),
        maxKB: limits.maxSizeKB,
        strategy: analysis.compressionStrategy
      });
      
      throw new Error(
        `Compresión inteligente de "${file.name}" no logró el objetivo. ` +
        `Resultado: ${Math.round(finalSizeKB)}KB, límite: ${limits.maxSizeKB}KB. ` +
        `Estrategia utilizada: ${analysis.compressionStrategy}. ` +
        `La imagen es demasiado compleja para comprimir efectivamente.`
      );
    }

    console.log('✅ intelligentCompression: Compresión inteligente exitosa:', {
      fileName: file.name,
      strategy: analysis.compressionStrategy,
      originalSizeKB: Math.round(originalSizeKB),
      finalSizeKB: Math.round(finalSizeKB),
      compressionRatio: `${compressionRatio}%`,
      savings: `${Math.round(originalSizeKB - finalSizeKB)}KB`,
      quality: 'Optimizada según características originales'
    });

    return {
      file: compressedFile,
      wasCompressed: true,
      originalSizeKB: Math.round(originalSizeKB),
      finalSizeKB: Math.round(finalSizeKB),
      compressionRatio,
      reason: `Compresión inteligente ${analysis.compressionStrategy}: ${compressionRatio}% de reducción, calidad optimizada`
    };

  } catch (error) {
    console.error('❌ intelligentCompression: Error crítico en compresión inteligente:', {
      fileName: file.name,
      originalSizeKB: Math.round(originalSizeKB),
      type,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    
    // Re-lanzar el error con contexto adicional
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Error inesperado en compresión inteligente de "${file.name}". Intenta con otro archivo.`);
    }
  }
};

/**
 * Valida que un archivo cumple SOLO con el límite de 9MB antes de procesamiento
 */
export const validateFileLimits = (file: File, type: 'avatar' | 'media'): { valid: boolean; error?: string } => {
  const fileSizeMB = file.size / (1024 * 1024);
  const maxUploadSizeMB = 9;

  console.log('🔍 intelligentCompression: Validando límite inicial de 9MB:', {
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

  // Verificar tipo de archivo para imágenes (validación básica)
  if (file.type.startsWith('image/')) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Formato "${file.type}" no soportado. Usa JPG, PNG, WebP o GIF.`
      };
    }
  }

  console.log('✅ intelligentCompression: Archivo válido para compresión inteligente (dentro de 9MB)');
  return { valid: true };
};
