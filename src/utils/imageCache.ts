
/**
 * Sistema de cache inteligente para imágenes
 * Reduce descargas innecesarias y costos de Backblaze B2
 */

interface CacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
}

class ImageCacheManager {
  private cache = new Map<string, CacheEntry>();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB máximo en cache
  private maxAge = 60 * 60 * 1000; // 1 hora
  private maxEntries = 100;

  constructor() {
    // Limpiar cache automáticamente cada 5 minutos
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async get(fileId: string, fetchFunction: () => Promise<string>): Promise<string> {
    const cacheKey = `img_${fileId}`;
    const cached = this.cache.get(cacheKey);

    // Verificar si existe en cache y no ha expirado
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      console.log('🎯 ImageCache: Imagen servida desde cache:', fileId);
      cached.accessCount++;
      cached.lastAccess = Date.now();
      return cached.url;
    }

    console.log('📥 ImageCache: Descargando imagen:', fileId);
    
    try {
      // Obtener URL firmada
      const signedUrl = await fetchFunction();
      
      // Descargar y cachear la imagen
      const response = await fetch(signedUrl);
      if (!response.ok) {
        throw new Error(`Error descargando imagen: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Guardar en cache
      const entry: CacheEntry = {
        url: objectUrl,
        blob,
        timestamp: Date.now(),
        accessCount: 1,
        lastAccess: Date.now()
      };

      this.cache.set(cacheKey, entry);
      
      // Limpiar cache si es necesario
      this.enforceMemoryLimits();

      console.log('✅ ImageCache: Imagen cacheada exitosamente:', {
        fileId,
        size: blob.size,
        cacheSize: this.getCacheSize()
      });

      return objectUrl;
    } catch (error) {
      console.error('❌ ImageCache: Error cacheando imagen:', error);
      // Fallback a URL firmada directa si falla el cache
      return await fetchFunction();
    }
  }

  private getCacheSize(): number {
    return Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.blob.size, 0);
  }

  private enforceMemoryLimits(): void {
    const currentSize = this.getCacheSize();
    
    if (currentSize > this.maxCacheSize || this.cache.size > this.maxEntries) {
      console.log('🧹 ImageCache: Limpiando cache por límites de memoria');
      
      // Ordenar por última vez accedida (LRU)
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.lastAccess - b.lastAccess);

      // Eliminar las más antiguas hasta estar bajo el límite
      const entriesToRemove = Math.max(
        this.cache.size - this.maxEntries,
        Math.ceil(entries.length * 0.3) // Eliminar 30% si excede tamaño
      );

      for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
        const [key, entry] = entries[i];
        URL.revokeObjectURL(entry.url);
        this.cache.delete(key);
      }

      console.log('✅ ImageCache: Cache limpiado:', {
        eliminados: entriesToRemove,
        restantes: this.cache.size,
        nuevoTamaño: this.getCacheSize()
      });
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.maxAge) {
        expiredKeys.push(key);
        URL.revokeObjectURL(entry.url);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log('🕒 ImageCache: Limpieza automática:', {
        eliminadas: expiredKeys.length,
        restantes: this.cache.size
      });
    }
  }

  clear(): void {
    this.cache.forEach(entry => URL.revokeObjectURL(entry.url));
    this.cache.clear();
    console.log('🗑️ ImageCache: Cache completamente limpiado');
  }

  getStats() {
    return {
      entries: this.cache.size,
      totalSize: this.getCacheSize(),
      maxSize: this.maxCacheSize,
      maxAge: this.maxAge
    };
  }
}

// Singleton para el cache global
export const imageCache = new ImageCacheManager();
