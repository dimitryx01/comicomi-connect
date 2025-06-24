
/**
 * Cache optimizado para reducir transacciones B2
 */

interface CacheEntry {
  data: string;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  component: string;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  transactionsSaved: number;
}

class OptimizedB2Cache {
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 30 * 60 * 1000; // 30 minutos
  private readonly maxSize = 500; // Máximo 500 entradas
  private hits = 0;
  private misses = 0;
  private transactionsSaved = 0;

  /**
   * Obtiene una entrada del cache con optimización de costos
   */
  async get<T>(
    key: string, 
    fetchFunction: () => Promise<T>,
    options: {
      ttl?: number;
      component?: string;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<T> {
    const { ttl = this.defaultTTL, component = 'unknown', priority = 'medium' } = options;
    
    console.log('🔍 OptimizedB2Cache: Solicitando archivo:', {
      key: key.substring(0, 50) + '...',
      component,
      priority,
      cacheSize: this.cache.size
    });

    // Verificar cache primero
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < ttl) {
      // Cache hit - AHORRO DE TRANSACCIÓN
      cached.accessCount++;
      cached.lastAccess = now;
      this.hits++;
      this.transactionsSaved++;

      console.log('✅ OptimizedB2Cache: Cache HIT - Transacción ahorrada:', {
        key: key.substring(0, 30) + '...',
        component,
        ageMinutes: Math.round((now - cached.timestamp) / 60000),
        accessCount: cached.accessCount,
        transactionsSaved: this.transactionsSaved
      });

      return cached.data as T;
    }

    // Cache miss - NECESARIA TRANSACCIÓN B2
    this.misses++;
    
    console.log('❌ OptimizedB2Cache: Cache MISS - Generando transacción B2:', {
      key: key.substring(0, 30) + '...',
      component,
      reason: cached ? 'expired' : 'not_found',
      priority
    });

    try {
      // Obtener datos con monitoreo de transacciones
      const data = await fetchFunction();
      
      // Guardar en cache
      this.set(key, data as string, component);
      
      return data;
    } catch (error) {
      console.error('💥 OptimizedB2Cache: Error obteniendo datos:', {
        key: key.substring(0, 30) + '...',
        component,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Establece una entrada en el cache con limpieza inteligente
   */
  private set(key: string, data: string, component: string) {
    const now = Date.now();

    // Limpiar cache si está lleno
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccess: now,
      component
    });

    console.log('💾 OptimizedB2Cache: Entrada guardada:', {
      key: key.substring(0, 30) + '...',
      component,
      cacheSize: this.cache.size,
      sizeKB: Math.round(data.length / 1024)
    });
  }

  /**
   * Expulsa las entradas menos usadas
   */
  private evictLeastUsed() {
    const entries = Array.from(this.cache.entries());
    
    // Ordenar por menor uso y más antiguas
    entries.sort(([,a], [,b]) => {
      const scoreA = a.accessCount * (Date.now() - a.lastAccess);
      const scoreB = b.accessCount * (Date.now() - b.lastAccess);
      return scoreA - scoreB;
    });

    // Eliminar el 20% menos usado
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
    }

    console.log('🧹 OptimizedB2Cache: Limpieza de cache:', {
      removedEntries: toRemove,
      remainingEntries: this.cache.size,
      reason: 'least_used_eviction'
    });
  }

  /**
   * Invalida entradas por patrón
   */
  invalidate(pattern: string | RegExp) {
    let invalidated = 0;
    
    for (const [key] of this.cache) {
      if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    console.log('🔄 OptimizedB2Cache: Invalidación por patrón:', {
      pattern: pattern.toString(),
      invalidatedEntries: invalidated,
      remainingEntries: this.cache.size
    });
  }

  /**
   * Precarga archivos para evitar transacciones futuras
   */
  async preload(
    items: Array<{ key: string; fetchFunction: () => Promise<string>; component: string }>,
    options: { batchSize?: number; delayMs?: number } = {}
  ) {
    const { batchSize = 5, delayMs = 100 } = options;
    
    console.log('⚡ OptimizedB2Cache: Iniciando precarga:', {
      totalItems: items.length,
      batchSize,
      delayMs
    });

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(item => this.get(item.key, item.fetchFunction, { 
          component: item.component,
          priority: 'low'
        }))
      );

      // Pequeña pausa entre lotes
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    console.log('✅ OptimizedB2Cache: Precarga completada');
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;
    
    let totalSize = 0;
    for (const [, entry] of this.cache) {
      totalSize += entry.data.length;
    }

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate: Math.round(hitRate * 100) / 100,
      transactionsSaved: this.transactionsSaved
    };
  }

  /**
   * Limpia el cache completamente
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.transactionsSaved = 0;
    console.log('🧹 OptimizedB2Cache: Cache limpiado completamente');
  }

  /**
   * Genera reporte de eficiencia
   */
  generateEfficiencyReport(): string {
    const stats = this.getStats();
    
    return `
📊 REPORTE DE EFICIENCIA DEL CACHE B2
═══════════════════════════════════════

💾 ESTADÍSTICAS DEL CACHE:
- Entradas totales: ${stats.totalEntries}
- Tamaño total: ${Math.round(stats.totalSize / 1024)} KB
- Tasa de aciertos: ${stats.hitRate}%
- Transacciones ahorradas: ${stats.transactionsSaved}

💰 AHORRO ESTIMADO:
- Transacciones B2 evitadas: ${stats.transactionsSaved}
- Porcentaje de eficiencia: ${stats.hitRate}%

${stats.hitRate > 80 ? '✅ Excelente eficiencia de cache' :
  stats.hitRate > 60 ? '⚠️ Eficiencia moderada - Considerar ajustar TTL' :
  '🚨 Baja eficiencia - Revisar patrones de acceso'}
    `.trim();
  }
}

export const optimizedB2Cache = new OptimizedB2Cache();
