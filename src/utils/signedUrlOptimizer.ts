
/**
 * Optimizador avanzado para URLs firmadas
 * Maximiza reutilización y minimiza solicitudes innecesarias
 */

interface SignedUrlEntry {
  url: string;
  expiresAt: number;
  firstRequested: number;
  lastAccessed: number;
  accessCount: number;
  fileSize?: number;
}

interface BatchRequest {
  fileIds: string[];
  resolve: (urls: Record<string, string>) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

class SignedUrlOptimizer {
  private cache = new Map<string, SignedUrlEntry>();
  private batchQueue: BatchRequest[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 100; // ms
  private readonly BATCH_SIZE = 10;
  private readonly SAFETY_MARGIN = 5 * 60 * 1000; // 5 minutos antes de expirar
  private readonly MAX_CACHE_SIZE = 500;

  /**
   * Obtiene URL firmada con optimización inteligente
   */
  async getOptimizedSignedUrl(
    fileId: string,
    fetchFunction: () => Promise<string>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<string> {
    // Verificar cache primero
    const cached = this.cache.get(fileId);
    const now = Date.now();

    if (cached && this.isUrlValid(cached, now)) {
      // Actualizar estadísticas de acceso
      cached.lastAccessed = now;
      cached.accessCount++;
      
      console.log('🎯 SignedUrlOptimizer: Cache HIT para URL firmada:', {
        fileId: fileId.substring(0, 30) + '...',
        accessCount: cached.accessCount,
        timeToExpiry: Math.round((cached.expiresAt - now) / 1000 / 60) + 'm'
      });
      
      return cached.url;
    }

    // Si no está en cache o está expirado, solicitar nueva URL
    console.log('📡 SignedUrlOptimizer: Solicitando nueva URL firmada:', {
      fileId: fileId.substring(0, 30) + '...',
      reason: cached ? 'expired' : 'not_cached',
      priority
    });

    try {
      const url = await fetchFunction();
      
      // Guardar en cache con expiración calculada
      const expiresAt = this.calculateExpirationTime(url);
      this.cache.set(fileId, {
        url,
        expiresAt,
        firstRequested: now,
        lastAccessed: now,
        accessCount: 1
      });

      // Limpiar cache si es necesario
      this.cleanupCache();

      console.log('✅ SignedUrlOptimizer: URL firmada cacheada:', {
        fileId: fileId.substring(0, 30) + '...',
        expiresIn: Math.round((expiresAt - now) / 1000 / 60) + 'm'
      });

      return url;
    } catch (error) {
      console.error('❌ SignedUrlOptimizer: Error obteniendo URL firmada:', error);
      throw error;
    }
  }

  /**
   * Solicitud en batch para múltiples URLs
   */
  async getBatchSignedUrls(
    fileIds: string[],
    fetchFunction: (fileId: string) => Promise<string>
  ): Promise<Record<string, string>> {
    if (fileIds.length === 0) return {};
    
    console.log('📦 SignedUrlOptimizer: Procesando batch de URLs:', {
      count: fileIds.length,
      fileIds: fileIds.map(id => id.substring(0, 20) + '...').join(', ')
    });

    const results: Record<string, string> = {};
    const pendingIds: string[] = [];
    const now = Date.now();

    // Separar los que ya están en cache de los que necesitan fetch
    for (const fileId of fileIds) {
      const cached = this.cache.get(fileId);
      if (cached && this.isUrlValid(cached, now)) {
        cached.lastAccessed = now;
        cached.accessCount++;
        results[fileId] = cached.url;
      } else {
        pendingIds.push(fileId);
      }
    }

    console.log('📊 SignedUrlOptimizer: Resultado de batch cache:', {
      fromCache: Object.keys(results).length,
      needsFetch: pendingIds.length
    });

    // Procesar los pendientes
    if (pendingIds.length > 0) {
      const pendingResults = await Promise.allSettled(
        pendingIds.map(async (fileId) => {
          const url = await this.getOptimizedSignedUrl(fileId, () => fetchFunction(fileId));
          return { fileId, url };
        })
      );

      pendingResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results[result.value.fileId] = result.value.url;
        } else {
          console.warn('⚠️ SignedUrlOptimizer: Error en batch para fileId:', result.reason);
        }
      });
    }

    return results;
  }

  /**
   * Verifica si una URL firmada aún es válida
   */
  private isUrlValid(entry: SignedUrlEntry, now: number): boolean {
    return now < (entry.expiresAt - this.SAFETY_MARGIN);
  }

  /**
   * Calcula tiempo de expiración de una URL firmada
   */
  private calculateExpirationTime(url: string): number {
    // Por defecto, las URLs de B2 duran 1 hora
    // Asumimos 55 minutos para tener margen de seguridad
    return Date.now() + (55 * 60 * 1000);
  }

  /**
   * Limpia cache manteniendo las entradas más útiles
   */
  private cleanupCache(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;

    console.log('🧹 SignedUrlOptimizer: Iniciando limpieza de cache:', {
      currentSize: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE
    });

    const entries = Array.from(this.cache.entries());
    const now = Date.now();

    // Ordenar por utilidad (frecuencia de acceso y recencia)
    entries.sort(([, a], [, b]) => {
      // Priorizar por frecuencia de acceso
      if (a.accessCount !== b.accessCount) {
        return b.accessCount - a.accessCount;
      }
      // Luego por recencia
      return b.lastAccessed - a.lastAccessed;
    });

    // Eliminar las menos útiles
    const toKeep = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.8));
    const toRemove = entries.slice(toKeep.length);

    this.cache.clear();
    toKeep.forEach(([fileId, entry]) => {
      this.cache.set(fileId, entry);
    });

    console.log('✅ SignedUrlOptimizer: Limpieza completada:', {
      removed: toRemove.length,
      remaining: this.cache.size
    });
  }

  /**
   * Precarga URLs para archivos que probablemente se necesitarán
   */
  async preloadUrls(
    fileIds: string[],
    fetchFunction: (fileId: string) => Promise<string>,
    priority: 'high' | 'medium' | 'low' = 'low'
  ): Promise<void> {
    const uncachedIds = fileIds.filter(id => {
      const cached = this.cache.get(id);
      return !cached || !this.isUrlValid(cached, Date.now());
    });

    if (uncachedIds.length === 0) {
      console.log('✅ SignedUrlOptimizer: Todos los archivos ya están precargados');
      return;
    }

    console.log('🎯 SignedUrlOptimizer: Precargando URLs:', {
      count: uncachedIds.length,
      priority
    });

    // Precargar en batch pequeños para no sobrecargar
    const batchSize = priority === 'high' ? 5 : priority === 'medium' ? 3 : 2;
    
    for (let i = 0; i < uncachedIds.length; i += batchSize) {
      const batch = uncachedIds.slice(i, i + batchSize);
      
      // Pequeño delay entre batches para no saturar
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, priority === 'high' ? 100 : 300));
      }

      await this.getBatchSignedUrls(batch, fetchFunction);
    }
  }

  /**
   * Obtiene estadísticas del optimizador
   */
  getStats(): {
    cacheSize: number;
    totalAccesses: number;
    averageAccessCount: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    return {
      cacheSize: this.cache.size,
      totalAccesses: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      averageAccessCount: entries.length > 0 ? 
        entries.reduce((sum, entry) => sum + entry.accessCount, 0) / entries.length : 0,
      oldestEntry: entries.length > 0 ? 
        Math.min(...entries.map(entry => now - entry.firstRequested)) : 0,
      newestEntry: entries.length > 0 ? 
        Math.min(...entries.map(entry => now - entry.firstRequested)) : 0
    };
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ SignedUrlOptimizer: Cache limpiado completamente');
  }
}

// Singleton global
export const signedUrlOptimizer = new SignedUrlOptimizer();
