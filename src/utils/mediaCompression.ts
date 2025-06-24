/**
 * Utilidades para compresión de medios (fotos y videos)
 * Optimiza archivos para reducir tamaño manteniendo calidad visual
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: string;
}

interface VideoCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  bitrate?: number;
  format?: string;
}

/**
 * Comprime una imagen usando Canvas API
 * Convierte automáticamente a WebP para mejor compresión
 */
export const compressImage = async (
  file: File, 
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/webp'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir a blob comprimido
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: format,
              lastModified: Date.now()
            });
            
            console.log(`Imagen comprimida: ${file.size} -> ${blob.size} bytes (${Math.round((1 - blob.size/file.size) * 100)}% reducción)`);
            resolve(compressedFile);
          } else {
            reject(new Error('Error al comprimir imagen'));
          }
        },
        format,
        quality
      );
    };

    img.onerror = () => reject(new Error('Error al cargar imagen'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Comprime un video usando MediaRecorder API (experimental)
 * Nota: Para producción se recomienda usar un servicio backend
 */
export const compressVideo = async (
  file: File,
  options: VideoCompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    bitrate = 1000000 // 1 Mbps
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.onloadedmetadata = () => {
      // Calcular nuevas dimensiones
      let { videoWidth: width, videoHeight: height } = video;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Configurar MediaRecorder para comprimir video
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: bitrate
      });

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const compressedFile = new File([blob], file.name, {
          type: 'video/webm',
          lastModified: Date.now()
        });
        
        console.log(`Video comprimido: ${file.size} -> ${blob.size} bytes (${Math.round((1 - blob.size/file.size) * 100)}% reducción)`);
        resolve(compressedFile);
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error('Error al comprimir video'));
      };

      // Iniciar grabación
      mediaRecorder.start();

      // Reproducir video y dibujar frames en canvas
      video.play();
      
      const drawFrame = () => {
        if (!video.paused && !video.ended) {
          ctx?.drawImage(video, 0, 0, width, height);
          requestAnimationFrame(drawFrame);
        } else {
          mediaRecorder.stop();
        }
      };
      
      drawFrame();
    };

    video.onerror = () => reject(new Error('Error al cargar video'));
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Detecta el tipo de archivo y aplica la compresión correspondiente
 */
export const compressMedia = async (file: File, options: CompressionOptions = {}): Promise<File> => {
  if (file.type.startsWith('image/')) {
    return await compressImage(file, options);
  } else if (file.type.startsWith('video/')) {
    // Para videos, usamos compresión básica por ahora
    // En producción se recomienda procesamiento en servidor
    console.log('Compresión de video disponible solo con procesamiento en servidor');
    return file;
  } else {
    throw new Error('Tipo de archivo no soportado para compresión');
  }
};

/**
 * Valida el tamaño y tipo de archivo antes de la compresión
 */
export const validateMediaFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 15 * 1024 * 1024; // 15MB
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'image/heic', 'image/heif', // Soporte para HEIC/HEIF
    'video/mp4', 'video/webm', 'video/mov', 'video/avi'
  ];

  // También verificar por extensión para archivos HEIC
  const fileName = file.name.toLowerCase();
  const hasValidExtension = fileName.endsWith('.heic') || fileName.endsWith('.heif') || 
                           allowedTypes.some(type => {
                             const ext = type.split('/')[1];
                             return fileName.endsWith(`.${ext}`);
                           });

  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo es demasiado grande. Máximo 15MB.' };
  }

  if (!allowedTypes.includes(file.type) && !hasValidExtension) {
    return { valid: false, error: 'Tipo de archivo no permitido.' };
  }

  return { valid: true };
};
