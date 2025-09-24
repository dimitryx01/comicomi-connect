/**
 * Detecta si un string es una URL pública o un fileId privado
 */
export const isPublicUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // URL pública debe empezar con http:// o https://
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Detecta si es una URL pública del bucket comicomi-media-public
 */
export const isPublicMediaUrl = (url: string | null | undefined): boolean => {
  if (!isPublicUrl(url)) return false;
  
  return url!.includes('comicomi-media-public');
};

/**
 * Detecta si es un fileId privado (no es URL pública)
 */
export const isPrivateFileId = (fileId: string | null | undefined): boolean => {
  return !isPublicUrl(fileId);
};