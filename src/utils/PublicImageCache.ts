/**
 * PublicImageCache - Wrapper inteligente sobre UniversalImageCache
 * 
 * Propósito: Interface simplificada para imágenes que pueden ser públicas o privadas
 * - Detección automática de tipo de imagen
 * - Para URLs públicas: usa directamente sin fetchFunction
 * - Para fileIds privados: requiere fetchFunction
 * 
 * Uso:
 * ```typescript
 * import { publicImageCache } from '@/utils/PublicImageCache';
 * 
 * // Para imagen pública (restaurante, receta)
 * const url = await publicImageCache.getImage(publicUrl);
 * 
 * // Para imagen privada (avatar, posts)
 * const url = await publicImageCache.getImage(fileId, fetchFunction);
 * ```
 */

import { universalImageCache } from './UniversalImageCache';
import { isPublicUrl } from './publicUrlDetector';

export interface PublicImageCacheOptions {
  type?: 'avatar' | 'restaurant' | 'recipe' | 'post' | 'general';
  priority?: 'high' | 'medium' | 'low';
}

class PublicImageCache {
  /**
   * Obtiene una imagen con detección automática de tipo
   */
  async getImage(
    fileIdOrUrl: string | null | undefined,
    fetchFunction?: (() => Promise<string>) | null | undefined,
    options?: PublicImageCacheOptions
  ): Promise<string> {
    if (!fileIdOrUrl) {
      throw new Error('FileId o URL requerido');
    }

    const { type = 'general' } = options || {};

    console.log('🎯 PublicImageCache: Procesando imagen:', {
      input: fileIdOrUrl.substring(0, 50) + '...',
      type,
      isPublic: isPublicUrl(fileIdOrUrl),
      hasFetchFunction: !!fetchFunction
    });

    // Usar UniversalImageCache con detección automática
    return await universalImageCache.getImage(fileIdOrUrl, fetchFunction);
  }

  /**
   * Método específico para imágenes de restaurantes (siempre públicas)
   */
  async getRestaurantImage(publicUrl: string | null | undefined): Promise<string> {
    if (!publicUrl) {
      throw new Error('URL pública requerida para imagen de restaurante');
    }

    if (!isPublicUrl(publicUrl)) {
      throw new Error('URL de restaurante debe ser pública');
    }

    return this.getImage(publicUrl, undefined, { type: 'restaurant' });
  }

  /**
   * Método específico para imágenes de recetas (siempre públicas)
   */
  async getRecipeImage(publicUrl: string | null | undefined): Promise<string> {
    if (!publicUrl) {
      throw new Error('URL pública requerida para imagen de receta');
    }

    if (!isPublicUrl(publicUrl)) {
      throw new Error('URL de receta debe ser pública');
    }

    return this.getImage(publicUrl, undefined, { type: 'recipe' });
  }

  /**
   * Método específico para avatares (requiere fetchFunction para privados)
   */
  async getAvatarImage(
    fileIdOrUrl: string | null | undefined,
    fetchFunction?: (() => Promise<string>) | null | undefined
  ): Promise<string> {
    if (!fileIdOrUrl) {
      throw new Error('FileId o URL requerido para avatar');
    }

    // Si es privado, fetchFunction es obligatorio
    if (!isPublicUrl(fileIdOrUrl) && !fetchFunction) {
      throw new Error('FetchFunction requerida para avatar privado');
    }

    return this.getImage(fileIdOrUrl, fetchFunction, { type: 'avatar', priority: 'high' });
  }

  /**
   * Precargar imagen en cache
   */
  async preloadImage(
    fileIdOrUrl: string,
    fetchFunction?: (() => Promise<string>) | null | undefined,
    options?: PublicImageCacheOptions
  ): Promise<void> {
    try {
      await this.getImage(fileIdOrUrl, fetchFunction, options);
      console.log('✅ PublicImageCache: Imagen precargada exitosamente');
    } catch (error) {
      console.warn('⚠️ PublicImageCache: Error precargando imagen:', error);
    }
  }

  /**
   * Eliminar imagen del cache
   */
  async removeImage(fileIdOrUrl: string): Promise<void> {
    const cacheKey = isPublicUrl(fileIdOrUrl) ? `public_${fileIdOrUrl}` : fileIdOrUrl;
    await universalImageCache.removeImage(cacheKey);
  }

  /**
   * Limpiar todo el cache
   */
  async clearAll(): Promise<void> {
    await universalImageCache.clearAll();
  }

  /**
   * Obtener métricas del cache
   */
  getMetrics() {
    return universalImageCache.getMetrics();
  }
}

// Singleton para uso global
export const publicImageCache = new PublicImageCache();