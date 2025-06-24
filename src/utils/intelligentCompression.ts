
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
  adaptiveResize: boolean; // Nuevo: redimensionado adaptativo
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
  aspectRatio: number;
  format: 'landscape' | 'portrait' | 'square';
  recommendedDimensions: { width: number; height: number };
}

// Límites específicos por tipo de archivo con redimensionado inteligente
const COMPRESSION_LIMITS: Record<string, CompressionLimits> = {
  avatar: {
    maxSizeKB: 80,      // Límite estricto
    targetSizeKB: 70,   // Objetivo con margen de seguridad
    minQuality: 0.4,    // Calidad mínima aceptable
    maxWidth: 400,
    maxHeight: 400,
    adaptiveResize: true // Redimensionado cuadrado para avatares
  },
  media: {
    maxSizeKB: 150,     // Límite estricto
    targetSizeKB: 130,  // Objetivo con margen de seguridad
    minQuality: 0.5,    // Calidad mínima aceptable
    maxWidth: 1920,     // Aumentado para soportar fotos modernas
    maxHeight: 1920,    // Cuadrado para soportar cualquier orientación
    adaptiveResize: true // Redimensionado inteligente según formato
  }
};

/**
 * Calcula dimensiones óptimas basadas en el formato y tamaño original
 */
const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  limits: CompressionLimits,
  type: 'avatar' | 'media'
): { width: number; height: number; needsResize: boolean } => {
  const aspectRatio = originalWidth / originalHeight;
  
  console.log('📐 intelligentCompression: Calculando dimensiones óptimas:', {
    original: `${originalWidth}x${originalHeight}`,
    aspectRatio: Math.round(aspectRatio * 100) / 100,
    type
  });

  // Para avatares: siempre cuadrado
  if (type === 'avatar') {
    const size = Math.min(limits.maxWidth, limits.maxHeight);
    return {
      width: size,
      height: size,
      needsResize: originalWidth > size || originalHeight > size
    };
  }

  // Para media: dimensiones inteligentes según formato
  const maxDimension = Math.max(originalWidth, originalHeight);
  const minDimension = Math.min(originalWidth, originalHeight);
  
  // Determinar límites según orientación y formato
  let targetMaxDimension: number;
  let targetMinDimension: number;

  if (aspectRatio > 1.5) {
    // Formato panorámico (16:9, etc.)
    targetMaxDimension = 1920;
    targetMinDimension = Math.round(targetMaxDimension / aspectRatio);
  } else if (aspectRatio < 0.75) {
    // Formato retrato extremo (9:16, etc.)
    targetMaxDimension = 1920;
    targetMinDimension = Math.round(targetMaxDimension * aspectRatio);
  } else {
    // Formato estándar (4:3, 3:2, etc.) - Muy común en fotos de iPhone
    targetMaxDimension = 1600; // Reducido para mejor compresión
    targetMinDimension = Math.round(targetMaxDimension / aspectRatio);
  }

  // Asegurar que no exceda los límites absolutos
  targetMaxDimension = Math.min(targetMaxDimension, limits.maxWidth);
  targetMinDimension = Math.min(targetMinDimension, limits.maxHeight);

  const needsResize = maxDimension > targetMaxDimension || minDimension > targetMinDimension;

  // Determinar ancho y alto finales
  let finalWidth: number;
  let finalHeight: number;

  if (originalWidth > originalHeight) {
    // Paisaje
    finalWidth = targetMaxDimension;
    finalHeight = targetMinDimension;
  } else {
    // Retrato
    finalWidth = targetMinDimension;
    finalHeight = targetMaxDimension;
  }

  console.log('🎯 intelligentCompression: Dimensiones calculadas:', {
    originalDimensions: `${originalWidth}x${originalHeight}`,
    targetDimensions: `${finalWidth}x${finalHeight}`,
    needsResize,
    format: aspectRatio > 1 ? 'landscape' : aspectRatio < 1 ? 'portrait' : 'square'
  });

  return {
    width: Math.round(finalWidth),
    height: Math.round(finalHeight),
    needsResize
  };
};

/**
 * Analiza las características de una imagen para determinar la estrategia de compresión óptima
 */
const analyzeImageForCompression = async (
  file: File,
  limits: CompressionLimits,
  type: 'avatar' | 'media'
): Promise<ImageAnalysis> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const originalSizeKB = file.size / 1024;
      const aspectRatio = img.width / img.height;
      
      // Determinar formato de imagen
      let format: ImageAnalysis['format'];
      if (aspectRatio > 1.1) format = 'landscape';
      else if (aspectRatio < 0.9) format = 'portrait';
      else format = 'square';
      
      // Calcular dimensiones recomendadas
      const recommendedDimensions = calculateOptimalDimensions(img.width, img.height, limits, type);
      
      // Categorizar por tamaño de archivo
      let sizeCategory: ImageAnalysis['sizeCategory'];
      if (originalSizeKB < limits.maxSizeKB * 0.5) {
        sizeCategory = 'small';
      } else if (originalSizeKB < limits.maxSizeKB * 1.5) {
        sizeCategory = 'medium';
      } else {
        sizeCategory = 'large';
      }
      
      // Determinar estrategia basada en tamaño y necesidad de redimensionado
      let suggestedQuality: number;
      let compressionStrategy: ImageAnalysis['compressionStrategy'];
      
      if (sizeCategory === 'small' && !recommendedDimensions.needsResize) {
        // Imagen pequeña sin necesidad de redimensionar
        suggestedQuality = 0.85;
        compressionStrategy = 'gentle';
      } else if (sizeCategory === 'medium' || (sizeCategory === 'small' && recommendedDimensions.needsResize)) {
        // Imagen mediana o pequeña que necesita procesamiento
        suggestedQuality = 0.75;
        compressionStrategy = 'moderate';
      } else {
        // Imagen grande: más agresivo pero conservando calidad
        suggestedQuality = 0.70; // Aumentado de 0.65
        compressionStrategy = 'moderate'; // Cambiado de 'aggressive'
      }
      
      console.log('🔍 intelligentCompression: Análisis completado:', {
        fileName: file.name,
        originalSizeKB: Math.round(originalSizeKB),
        dimensionsOriginal: `${img.width}x${img.height}`,
        format,
        aspectRatio: Math.round(aspectRatio * 100) / 100,
        sizeCategory,
        needsResize: recommendedDimensions.needsResize,
        recommendedDimensions: `${recommendedDimensions.width}x${recommendedDimensions.height}`,
        suggestedQuality,
        compressionStrategy
      });
      
      resolve({
        sizeCategory,
        needsResize: recommendedDimensions.needsResize,
        suggestedQuality,
        compressionStrategy,
        aspectRatio,
        format,
        recommendedDimensions
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
          suggestedQuality: analysis.suggestedQuality,
          format: analysis.format
        });

        // Usar las dimensiones recomendadas del análisis
        const { width, height } = analysis.recommendedDimensions;
        
        canvas.width = width;
        canvas.height = height;
        
        // Aplicar filtros de calidad al contexto
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }
        
        ctx?.drawImage(img, 0, 0, width, height);

        console.log('✂️ intelligentCompression: Dimensiones aplicadas:', {
          originalDimensions: `${img.width}x${img.height}`,
          finalDimensions: `${width}x${height}`,
          reductionRatio: Math.round((1 - (width * height) / (img.width * img.height)) * 100) + '%'
        });

        // Determinar niveles de calidad según estrategia (más conservadores)
        let qualityLevels: number[];
        
        switch (analysis.compressionStrategy) {
          case 'gentle':
            qualityLevels = [analysis.suggestedQuality, 0.8, 0.75, Math.max(0.7, limits.minQuality)];
            break;
          case 'moderate':
            qualityLevels = [analysis.suggestedQuality, 0.7, 0.65, Math.max(0.6, limits.minQuality)];
            break;
          case 'aggressive':
            qualityLevels = [analysis.suggestedQuality, 0.6, 0.55, 0.5, limits.minQuality];
            break;
        }

        console.log('🎯 intelligentCompression: Probando niveles de calidad:', {
          strategy: analysis.compressionStrategy,
          qualityLevels,
          targetKB: limits.targetSizeKB,
          maxKB: limits.maxSizeKB
        });

        // Probar WebP primero (mejor compresión)
        for (const quality of qualityLevels) {
          try {
            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob(resolve, 'image/webp', quality);
            });

            if (blob) {
              const sizeKB = blob.size / 1024;
              
              console.log('🔄 intelligentCompression: Resultado WebP con calidad', quality + ':', {
                resultSizeKB: Math.round(sizeKB),
                targetKB: limits.targetSizeKB,
                maxKB: limits.maxSizeKB
              });

              if (sizeKB <= limits.targetSizeKB) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/webp',
                  lastModified: Date.now()
                });
                
                console.log('✅ intelligentCompression: Objetivo alcanzado con WebP');
                resolve(compressedFile);
                return;
              }
              
              if (sizeKB <= limits.maxSizeKB && quality === qualityLevels[qualityLevels.length - 1]) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/webp',
                  lastModified: Date.now()
                });
                
                console.log('✅ intelligentCompression: Límite máximo alcanzado con WebP');
                resolve(compressedFile);
                return;
              }
            }
          } catch (error) {
            console.warn('⚠️ intelligentCompression: Error con WebP calidad', quality);
          }
        }

        // Fallback a JPEG con calidades más conservadoras
        console.log('🔄 intelligentCompression: Intentando fallback JPEG...');
        
        const jpegQualityLevels = [0.8, 0.7, 0.6, 0.5, 0.4];
        
        for (const quality of jpegQualityLevels) {
          try {
            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob(resolve, 'image/jpeg', quality);
            });

            if (blob) {
              const sizeKB = blob.size / 1024;
              
              console.log('🔄 intelligentCompression: Resultado JPEG con calidad', quality + ':', {
                resultSizeKB: Math.round(sizeKB),
                maxKB: limits.maxSizeKB
              });

              if (sizeKB <= limits.maxSizeKB) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                
                console.log('✅ intelligentCompression: Fallback JPEG exitoso');
                resolve(compressedFile);
                return;
              }
            }
          } catch (error) {
            console.warn('⚠️ intelligentCompression: Error en JPEG calidad', quality);
          }
        }

        // Si aún no funciona, error descriptivo
        console.error('❌ intelligentCompression: No se pudo comprimir dentro de límites:', {
          fileName: file.name,
          originalSizeKB: Math.round(file.size / 1024),
          strategy: analysis.compressionStrategy,
          finalDimensions: `${width}x${height}`,
          limitKB: limits.maxSizeKB
        });
        
        reject(new Error(
          `No se pudo comprimir "${file.name}" dentro del límite de ${limits.maxSizeKB}KB. ` +
          `Tamaño original: ${Math.round(file.size / 1024)}KB. ` +
          `Dimensiones procesadas: ${width}x${height}. ` +
          `Intenta con una imagen de menor resolución o calidad.`
        ));
        
      } catch (error) {
        console.error('❌ intelligentCompression: Error crítico:', error);
        reject(error);
      }
    };

    img.onerror = (error) => {
      reject(new Error(`Error cargando imagen "${file.name}"`));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Aplica compresión inteligente OBLIGATORIA con análisis adaptativo mejorado
 */
export const applyIntelligentCompression = async (
  file: File,
  type: 'avatar' | 'media'
): Promise<CompressionResult> => {
  const originalSizeKB = file.size / 1024;
  const limits = COMPRESSION_LIMITS[type];

  console.log('🚀 intelligentCompression: Iniciando compresión inteligente mejorada:', {
    fileName: file.name,
    type,
    originalSizeKB: Math.round(originalSizeKB),
    fileType: file.type,
    limits: {
      maxKB: limits.maxSizeKB,
      targetKB: limits.targetSizeKB
    }
  });

  try {
    // Solo comprimir imágenes
    if (!file.type.startsWith('image/')) {
      console.log('⚠️ intelligentCompression: Archivo no es imagen, validando tamaño únicamente');
      
      if (originalSizeKB > limits.maxSizeKB) {
        throw new Error(
          `El archivo "${file.name}" (${Math.round(originalSizeKB)}KB) no es una imagen y excede el límite de ${limits.maxSizeKB}KB.`
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

    // Analizar imagen con el nuevo sistema
    console.log('🔍 intelligentCompression: Analizando características de la imagen...');
    const analysis = await analyzeImageForCompression(file, limits, type);
    
    // Aplicar compresión inteligente mejorada
    console.log('🎯 intelligentCompression: Aplicando compresión mejorada...');
    const compressedFile = await compressImageIntelligently(file, limits, analysis);
    
    const finalSizeKB = compressedFile.size / 1024;
    const compressionRatio = Math.round((1 - compressedFile.size / file.size) * 100);

    // Verificar resultado final
    if (finalSizeKB > limits.maxSizeKB) {
      throw new Error(
        `Compresión de "${file.name}" excedió límites. ` +
        `Resultado: ${Math.round(finalSizeKB)}KB, límite: ${limits.maxSizeKB}KB.`
      );
    }

    console.log('✅ intelligentCompression: Compresión exitosa:', {
      fileName: file.name,
      strategy: analysis.compressionStrategy,
      format: analysis.format,
      originalSizeKB: Math.round(originalSizeKB),
      finalSizeKB: Math.round(finalSizeKB),
      compressionRatio: `${compressionRatio}%`,
      dimensionsUsed: `${analysis.recommendedDimensions.width}x${analysis.recommendedDimensions.height}`
    });

    return {
      file: compressedFile,
      wasCompressed: true,
      originalSizeKB: Math.round(originalSizeKB),
      finalSizeKB: Math.round(finalSizeKB),
      compressionRatio,
      reason: `Compresión ${analysis.compressionStrategy} para formato ${analysis.format}: ${compressionRatio}% de reducción`
    };

  } catch (error) {
    console.error('❌ intelligentCompression: Error:', {
      fileName: file.name,
      originalSizeKB: Math.round(originalSizeKB),
      type,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    
    throw error;
  }
};

/**
 * Valida que un archivo cumple con el límite de 15MB antes de procesamiento
 */
export const validateFileLimits = (file: File, type: 'avatar' | 'media'): { valid: boolean; error?: string } => {
  const fileSizeMB = file.size / (1024 * 1024);
  const maxUploadSizeMB = 15;

  console.log('🔍 intelligentCompression: Validando límite de 15MB:', {
    fileName: file.name,
    sizeMB: Math.round(fileSizeMB * 100) / 100,
    type,
    withinLimit: fileSizeMB <= maxUploadSizeMB
  });

  if (fileSizeMB > maxUploadSizeMB) {
    return { 
      valid: false, 
      error: `Archivo demasiado grande (${Math.round(fileSizeMB * 100) / 100}MB). Máximo: ${maxUploadSizeMB}MB.` 
    };
  }

  // Verificar tipos permitidos
  if (file.type.startsWith('image/')) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Formato "${file.type}" no soportado. Usa JPG, PNG, WebP o GIF.`
      };
    }
  }

  console.log('✅ intelligentCompression: Archivo válido para procesamiento');
  return { valid: true };
};
