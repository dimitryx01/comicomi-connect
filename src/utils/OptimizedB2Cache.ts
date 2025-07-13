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
  private readonly maxSize = 500; // Mu00e1ximo 500 entradas
  private hits = 0;
  private misses = 0;
  private transactionsSaved = 0;
  private inProgressRequests = new Map<string, Promise<any>>();

  /**
   * Obtiene una entrada del cache con optimizaciu00f3n de costos
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
    const { ttl = this.defaultTTL, component = 'unknown' } = options;
    
    // Verificar cache primero
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < ttl) {
      // Cache hit - AHORRO DE TRANSACCIu00d3N
      cached.accessCount++;
      cached.lastAccess = now;
      this.hits++;
      this.transactionsSaved++;
      return cached.data as T;
    }

    // Verificar si ya hay una solicitud en progreso para esta clave
    if (this.inProgressRequests.has(key)) {
      // Reutilizar la promesa existente para evitar solicitudes duplicadas
      return this.inProgressRequests.get(key) as Promise<T>;
    }

    // Cache miss - NECESARIA TRANSACCIu00d3N B2
    this.misses++;

    // Crear una nueva promesa y almacenarla
    const fetchPromise = (async () => {
      try {
        // Obtener datos con monitoreo de transacciones
        const data = await fetchFunction();
        
        // Guardar en cache
        this.set(key, data as string, component);
        
        // Eliminar de solicitudes en progreso
        this.inProgressRequests.delete(key);
        
        return data;
      } catch (error) {
        // Eliminar de solicitudes en progreso en caso de error
        this.inProgressRequests.delete(key);
        throw error;
      }
    })();

    // Almacenar la promesa para futuras solicitudes durante esta operaciu00f3n
    this.inProgressRequests.set(key, fetchPromise);
    
    return fetchPromise;
  }

  /**
   * Establece una entrada en el cache con limpieza inteligente
   */
  private set(key: string, data: string, component: string) {
    const now = Date.now();

    // Limpiar cache si estu00e1 lleno
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
  }

  /**
   * Expulsa las entradas menos usadas
   */
  private evictLeastUsed() {
    const entries = Array.from(this.cache.entries());
    
    // Ordenar por menor uso y mu00e1s antiguas
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
  }

  /**
   * Invalida entradas por patru00f3n
   */
  invalidate(pattern: string | RegExp) {
    let invalidated = 0;
    
    for (const [key] of this.cache) {
      if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
  }

  /**
   * Precarga archivos para evitar transacciones futuras
   */
  async preload(
    items: Array<{ key: string; fetchFunction: () => Promise<string>; component: string }>,
    options: { batchSize?: number; delayMs?: number } = {}
  ) {
    const { batchSize = 5, delayMs = 100 } = options;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(item => this.get(item.key, item.fetchFunction, { 
          component: item.component,
          priority: 'low'
        }))
      );

      // Pequeu00f1a pausa entre lotes
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  /**
   * Obtiene estadu00edsticas del cache
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
    this.inProgressRequests.clear();
    this.hits = 0;
    this.misses = 0;
    this.transactionsSaved = 0;
  }

  /**
   * Genera reporte de eficiencia
   */
  generateEfficiencyReport(): string {
    const stats = this.getStats();
    
    return `
ud83dudcca REPORTE DE EFICIENCIA DEL CACHE B2
u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550u2550

ud83dudcbe ESTADu00cdSTICAS DEL CACHE:
- Entradas totales: ${stats.totalEntries}
- Tamau00f1o total: ${Math.round(stats.totalSize / 1024)} KB
- Tasa de aciertos: ${stats.hitRate}%
- Transacciones ahorradas: ${stats.transactionsSaved}

ud83dudcb0 AHORRO ESTIMADO:
- Transacciones B2 evitadas: ${stats.transactionsSaved}
- Porcentaje de eficiencia: ${stats.hitRate}%

${stats.hitRate > 80 ? 'u2705 Excelente eficiencia de cache' :
  stats.hitRate > 60 ? 'u26a0ufe0f Eficiencia moderada - Considerar ajustar TTL' :
  'ud83dudea8 Baja eficiencia - Revisar patrones de acceso'}
    `.trim();
  }
}

export const optimizedB2Cache = new OptimizedB2Cache();