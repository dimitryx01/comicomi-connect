/**
 * Sistema de Cache Unificado Avanzado para optimización de transacciones Clase B
 * Reduce descargas duplicadas, implementa precarga inteligente y persistencia con IndexedDB
 * FASE 3: Integración con optimizadores avanzados y análisis de performance
 */

import { performanceAnalyzer } from './performanceAnalyzer';
import { signedUrlOptimizer } from './signedUrlOptimizer';

interface CacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  priority: 'high' | 'medium' | 'low';
  size: number;
  type: 'avatar' | 'media' | 'general';
  expiresAt?: number;
}

interface DownloadingLock {
  promise: Promise<string>;
  fileId: string;
  timestamp: number;
  abortController: AbortController;
}

interface CacheMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  duplicatePrevented: number;
  totalBytesServed: number;
  totalBytesSaved: number;
  preloadHits: number;
  indexedDbOperations: number;
  urlOptimizerHits: number;
}

interface PreloadItem {
  fileId: string;
  priority: 'high' | 'medium' | 'low';
  type: 'avatar' | 'media';
  fetchFunction: () => Promise<string>;
  addedAt: number;
}

class UnifiedMediaCacheManager {
  private cache = new Map<string, CacheEntry>();
  private downloadingLocks = new Map<string, DownloadingLock>();
  private preloadQueue: PreloadItem[] = [];
  private isPreloading = false;
  private dbName = 'comicomi-media-cache-v2';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;
  
  // Configuración del cache optimizada
  private maxCacheSize = 150 * 1024 * 1024; // 150MB máximo
  private maxAge = 4 * 60 * 60 * 1000; // 4 horas
  private maxEntries = 300;
  private preloadBatchSize = 3; // Reducido para mayor estabilidad
  private maxIndexedDbSize = 200 * 1024 * 1024; // 200MB en IndexedDB
  
  // Métricas expandidas
  private metrics: CacheMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    duplicatePrevented: 0,
    totalBytesServed: 0,
    totalBytesSaved: 0,
    preloadHits: 0,
    indexedDbOperations: 0,
    urlOptimizerHits: 0
  };

  constructor() {
    this.initializeIndexedDB();
    this.startPeriodicCleanup();
    this.startPreloadProcessor();
    console.log('🚀 UnifiedMediaCache v2: Sistema de cache unificado avanzado inicializado');
  }

  /**
   * Inicializa IndexedDB con esquema mejorado
   */
  private async initializeIndexedDB(): Promise<void> {
    try {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.warn('⚠️ UnifiedMediaCache: Error inicializando IndexedDB, usando cache en memoria');
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.loadFromIndexedDB();
        console.log('✅ UnifiedMediaCache: IndexedDB v2 inicializado exitosamente');
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Limpiar stores antiguos si existen
        if (db.objectStoreNames.contains('mediaCache')) {
          db.deleteObjectStore('mediaCache');
        }
        
        const store = db.createObjectStore('mediaCacheV2', { keyPath: 'fileId' });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('type', 'type');
        store.createIndex('priority', 'priority');
        store.createIndex('accessCount', 'accessCount');
        store.createIndex('expiresAt', 'expiresAt');
        
        console.log('🔄 UnifiedMediaCache: IndexedDB schema actualizado a v2');
      };
    } catch (error) {
      console.warn('⚠️ UnifiedMediaCache: IndexedDB no disponible, usando cache en memoria');
    }
  }

  /**
   * Carga datos persistentes desde IndexedDB con validación mejorada
   */
  private async loadFromIndexedDB(): Promise<void> {
    if (!this.db) return;
    
    const startTime = Date.now();
    
    try {
      const transaction = this.db.transaction(['mediaCacheV2'], 'readonly');
      const store = transaction.objectStore('mediaCacheV2');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const entries = request.result;
        const now = Date.now();
        let loadedCount = 0;
        let skippedCount = 0;
        
        entries.forEach((entry: any) => {
          // Validar expiración más estricta
          const isExpired = entry.expiresAt ? now > entry.expiresAt : 
                           (now - entry.timestamp) > this.maxAge;
          
          if (!isExpired && entry.blobData) {
            try {
              // Recrear blob desde ArrayBuffer
              const blob = new Blob([entry.blobData], { type: entry.blobType || 'application/octet-stream' });
              const url = URL.createObjectURL(blob);
              
              this.cache.set(entry.fileId, {
                url,
                blob,
                timestamp: entry.timestamp,
                accessCount: entry.accessCount || 0,
                lastAccess: entry.lastAccess || entry.timestamp,
                priority: entry.priority || 'medium',
                size: entry.size || blob.size,
                type: entry.type || 'general',
                expiresAt: entry.expiresAt
              });
              
              loadedCount++;
            } catch (error) {
              console.warn('⚠️ UnifiedMediaCache: Error recreando blob:', error);
              skippedCount++;
            }
          } else {
            skippedCount++;
          }
        });
        
        // Registrar métrica de carga
        performanceAnalyzer.recordMetric(
          'indexeddb_load',
          startTime,
          true,
          { loadedCount, skippedCount, totalEntries: entries.length }
        );
        
        console.log(`📦 UnifiedMediaCache: ${loadedCount} entradas cargadas desde IndexedDB (${skippedCount} descartadas)`);
      };
      
      request.onerror = () => {
        performanceAnalyzer.recordMetric('indexeddb_load', startTime, false);
        console.warn('⚠️ UnifiedMediaCache: Error cargando desde IndexedDB');
      };
    } catch (error) {
      performanceAnalyzer.recordMetric('indexeddb_load', startTime, false);
      console.warn('⚠️ UnifiedMediaCache: Error accediendo a IndexedDB:', error);
    }
  }

  /**
   * Guarda entrada en IndexedDB con optimización de tamaño
   */
  private async saveToIndexedDB(fileId: string, entry: CacheEntry): Promise<void> {
    if (!this.db || entry.size > 10 * 1024 * 1024) { // No guardar archivos >10MB
      return;
    }
    
    const startTime = Date.now();
    
    try {
      const arrayBuffer = await entry.blob.arrayBuffer();
      const transaction = this.db.transaction(['mediaCacheV2'], 'readwrite');
      const store = transaction.objectStore('mediaCacheV2');
      
      await store.put({
        fileId,
        timestamp: entry.timestamp,
        accessCount: entry.accessCount,
        lastAccess: entry.lastAccess,
        priority: entry.priority,
        size: entry.size,
        type: entry.type,
        expiresAt: entry.expiresAt,
        blobData: arrayBuffer,
        blobType: entry.blob.type
      });
      
      this.metrics.indexedDbOperations++;
      
      performanceAnalyzer.recordMetric('indexeddb_save', startTime, true, {
        fileSize: entry.size,
        type: entry.type
      });
      
    } catch (error) {
      performanceAnalyzer.recordMetric('indexeddb_save', startTime, false);
      console.warn('⚠️ UnifiedMediaCache: Error guardando en IndexedDB:', error);
    }
  }

  /**
   * Obtiene archivo con cache unificado y optimizaciones avanzadas
   */
  async get(
    fileId: string,
    fetchFunction: () => Promise<string>,
    options: {
      type?: 'avatar' | 'media' | 'general';
      priority?: 'high' | 'medium' | 'low';
      abortSignal?: AbortSignal;
    } = {}
  ): Promise<string> {
    const { type = 'general', priority = 'medium', abortSignal } = options;
    const cacheKey = `unified_${fileId}`;
    const startTime = Date.now();
    
    this.metrics.totalRequests++;
    
    console.log('🔍 UnifiedMediaCache v2: Solicitando archivo con optimización avanzada:', {
      fileId: fileId.substring(0, 30) + '...',
      type,
      priority,
      cacheSize: this.cache.size
    });
    
    // 1. Verificar cache en memoria primero
    const cached = this.cache.get(cacheKey);
    if (cached && this.isEntryValid(cached)) {
      cached.accessCount++;
      cached.lastAccess = Date.now();
      this.metrics.cacheHits++;
      this.metrics.totalBytesServed += cached.size;
      this.metrics.totalBytesSaved += cached.size;
      
      performanceAnalyzer.recordMetric('cache_hit', startTime, true, {
        type, priority, fileSize: cached.size, cacheHit: true
      });
      
      console.log('🎯 UnifiedMediaCache v2: Cache HIT en memoria:', {
        fileId: fileId.substring(0, 30) + '...',
        accessCount: cached.accessCount
      });
      
      return cached.url;
    }
    
    // 2. Verificar downloading lock
    const existingLock = this.downloadingLocks.get(fileId);
    if (existingLock && !existingLock.abortController.signal.aborted) {
      this.metrics.duplicatePrevented++;
      
      console.log('🔒 UnifiedMediaCache v2: Download lock activo, esperando...');
      
      try {
        return await existingLock.promise;
      } catch (error) {
        // Si falla el lock existente, continuar con nueva descarga
        this.downloadingLocks.delete(fileId);
      }
    }
    
    // 3. Crear downloading lock con cancelación
    const abortController = new AbortController();
    
    // Conectar con signal externo si se proporciona
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        abortController.abort('external_abort');
      });
    }
    
    const downloadPromise = this.performOptimizedDownload(
      fileId, 
      fetchFunction, 
      type, 
      priority, 
      abortController.signal
    );
    
    this.downloadingLocks.set(fileId, {
      promise: downloadPromise,
      fileId,
      timestamp: Date.now(),
      abortController
    });
    
    try {
      const result = await downloadPromise;
      return result;
    } catch (error) {
      if (abortController.signal.aborted) {
        console.log('🚫 UnifiedMediaCache v2: Descarga cancelada');
        throw new Error('Download cancelled');
      }
      throw error;
    } finally {
      this.downloadingLocks.delete(fileId);
    }
  }

  /**
   * Realiza descarga optimizada con URL optimizer y performance tracking
   */
  private async performOptimizedDownload(
    fileId: string,
    fetchFunction: () => Promise<string>,
    type: 'avatar' | 'media' | 'general',
    priority: 'high' | 'medium' | 'low',
    abortSignal: AbortSignal
  ): Promise<string> {
    const cacheKey = `unified_${fileId}`;
    const startTime = Date.now();
    
    try {
      console.log('📥 UnifiedMediaCache v2: Iniciando descarga optimizada:', {
        fileId: fileId.substring(0, 30) + '...',
        type,
        priority
      });
      
      // Usar URL optimizer para obtener URL firmada
      const signedUrl = await signedUrlOptimizer.getOptimizedSignedUrl(
        fileId,
        fetchFunction,
        priority
      );
      
      this.metrics.urlOptimizerHits++;
      
      // Verificar cancelación
      if (abortSignal.aborted) {
        throw new Error('Download aborted before fetch');
      }
      
      // Descargar archivo con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      // Combinar signals
      abortSignal.addEventListener('abort', () => controller.abort());
      
      const response = await fetch(signedUrl, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Verificar cancelación después de descarga
      if (abortSignal.aborted) {
        throw new Error('Download aborted after fetch');
      }
      
      const objectUrl = URL.createObjectURL(blob);
      
      // Crear entrada de cache con expiración
      const entry: CacheEntry = {
        url: objectUrl,
        blob,
        timestamp: Date.now(),
        accessCount: 1,
        lastAccess: Date.now(),
        priority,
        size: blob.size,
        type,
        expiresAt: Date.now() + this.maxAge
      };
      
      // Guardar en cache
      this.cache.set(cacheKey, entry);
      
      // Guardar en IndexedDB (async)
      this.saveToIndexedDB(cacheKey, entry);
      
      // Actualizar métricas
      this.metrics.cacheMisses++;
      this.metrics.totalBytesServed += blob.size;
      
      // Limpiar cache si es necesario
      this.enforceMemoryLimits();
      
      // Registrar performance
      performanceAnalyzer.recordMetric('optimized_download', startTime, true, {
        fileSize: blob.size,
        type,
        priority,
        cacheHit: false
      });
      
      console.log('✅ UnifiedMediaCache v2: Descarga y cache optimizados exitosos:', {
        fileId: fileId.substring(0, 30) + '...',
        sizeMB: Math.round(blob.size / 1024 / 1024 * 100) / 100
      });
      
      return objectUrl;
      
    } catch (error) {
      performanceAnalyzer.recordMetric('optimized_download', startTime, false, {
        error: error instanceof Error ? error.message : 'unknown'
      });
      
      console.error('❌ UnifiedMediaCache v2: Error en descarga optimizada:', error);
      
      // Fallback a URL firmada directa
      if (!abortSignal.aborted) {
        return await fetchFunction();
      }
      
      throw error;
    }
  }

  /**
   * Verifica si una entrada de cache es válida
   */
  private isEntryValid(entry: CacheEntry): boolean {
    const now = Date.now();
    
    // Verificar expiración
    if (entry.expiresAt && now > entry.expiresAt) {
      return false;
    }
    
    // Verificar edad máxima
    if (now - entry.timestamp > this.maxAge) {
      return false;
    }
    
    return true;
  }

  /**
   * Añade archivo a la cola de precarga
   */
  addToPreloadQueue(
    fileId: string,
    fetchFunction: () => Promise<string>,
    options: {
      type?: 'avatar' | 'media';
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): void {
    const { type = 'media', priority = 'medium' } = options;
    const cacheKey = `unified_${fileId}`;
    
    // No precargar si ya está en cache
    if (this.cache.has(cacheKey)) {
      return;
    }
    
    // No duplicar en cola de precarga
    if (this.preloadQueue.some(item => item.fileId === fileId)) {
      return;
    }
    
    this.preloadQueue.push({
      fileId,
      priority,
      type,
      fetchFunction,
      addedAt: Date.now()
    });
    
    // Ordenar por prioridad
    this.preloadQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    console.log('📋 UnifiedMediaCache: Añadido a cola de precarga:', {
      fileId: fileId.substring(0, 30) + '...',
      type,
      priority,
      queueSize: this.preloadQueue.length
    });
  }

  /**
   * Procesador de precarga en background
   */
  private startPreloadProcessor(): void {
    setInterval(async () => {
      if (this.isPreloading || this.preloadQueue.length === 0) {
        return;
      }
      
      this.isPreloading = true;
      
      try {
        // Procesar batch de precargas
        const batchItems = this.preloadQueue.splice(0, this.preloadBatchSize);
        
        console.log('🔄 UnifiedMediaCache: Procesando batch de precarga:', {
          batchSize: batchItems.length,
          remainingQueue: this.preloadQueue.length
        });
        
        await Promise.allSettled(
          batchItems.map(async (item) => {
            try {
              await this.get(item.fileId, item.fetchFunction, {
                type: item.type,
                priority: item.priority
              });
              
              // Si fue un hit de precarga, contarlo
              const cacheKey = `unified_${item.fileId}`;
              if (this.cache.has(cacheKey)) {
                this.metrics.preloadHits++;
              }
              
            } catch (error) {
              console.warn('⚠️ UnifiedMediaCache: Error en precarga:', {
                fileId: item.fileId.substring(0, 30) + '...',
                error
              });
            }
          })
        );
        
      } finally {
        this.isPreloading = false;
      }
    }, 2000); // Procesar cada 2 segundos
  }

  /**
   * Precarga inteligente para feed
   */
  preloadFeedMedia(
    feedItems: Array<{
      images?: string[];
      videos?: string[];
      authorAvatar?: string;
    }>,
    fetchFunction: (fileId: string) => Promise<string>
  ): void {
    console.log('🎯 UnifiedMediaCache: Iniciando precarga inteligente de feed:', {
      itemsCount: feedItems.length
    });
    
    feedItems.forEach((item, index) => {
      const priority = index < 3 ? 'high' : index < 10 ? 'medium' : 'low';
      
      // Precargar avatar del autor (alta prioridad)
      if (item.authorAvatar) {
        this.addToPreloadQueue(
          item.authorAvatar,
          () => fetchFunction(item.authorAvatar!),
          { type: 'avatar', priority: 'high' }
        );
      }
      
      // Precargar imágenes
      if (item.images) {
        item.images.forEach(imageId => {
          this.addToPreloadQueue(
            imageId,
            () => fetchFunction(imageId),
            { type: 'media', priority }
          );
        });
      }
      
      // Precargar videos (prioridad menor)
      if (item.videos) {
        item.videos.forEach(videoId => {
          this.addToPreloadQueue(
            videoId,
            () => fetchFunction(videoId),
            { type: 'media', priority: 'low' }
          );
        });
      }
    });
  }

  /**
   * Limpieza de memoria
   */
  private enforceMemoryLimits(): void {
    const currentSize = this.getCacheSize();
    
    if (currentSize > this.maxCacheSize || this.cache.size > this.maxEntries) {
      console.log('🧹 UnifiedMediaCache: Iniciando limpieza de memoria:', {
        currentSizeMB: Math.round(currentSize / 1024 / 1024),
        maxSizeMB: Math.round(this.maxCacheSize / 1024 / 1024),
        entries: this.cache.size,
        maxEntries: this.maxEntries
      });
      
      // Ordenar por última vez accedida y prioridad
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => {
          // Priorizar por tipo (avatares son más importantes)
          if (a.type === 'avatar' && b.type !== 'avatar') return 1;
          if (b.type === 'avatar' && a.type !== 'avatar') return -1;
          
          // Luego por frecuencia de acceso
          if (a.accessCount !== b.accessCount) {
            return a.accessCount - b.accessCount;
          }
          
          // Finalmente por última vez accedida
          return a.lastAccess - b.lastAccess;
        });
      
      // Eliminar las menos importantes
      const entriesToRemove = Math.max(
        this.cache.size - this.maxEntries,
        Math.ceil(entries.length * 0.3) // Eliminar 30% si excede tamaño
      );
      
      for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
        const [key, entry] = entries[i];
        URL.revokeObjectURL(entry.url);
        this.cache.delete(key);
      }
      
      console.log('✅ UnifiedMediaCache: Limpieza completada:', {
        eliminados: entriesToRemove,
        restantes: this.cache.size,
        nuevoTamañoMB: Math.round(this.getCacheSize() / 1024 / 1024)
      });
    }
  }

  /**
   * Limpieza periódica
   */
  private startPeriodicCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      
      // Limpiar downloading locks antiguos
      const expiredLocks: string[] = [];
      this.downloadingLocks.forEach((lock, fileId) => {
        if (now - lock.timestamp > 30000) { // 30 segundos
          expiredLocks.push(fileId);
        }
      });
      expiredLocks.forEach(fileId => this.downloadingLocks.delete(fileId));
      
      // Limpiar entradas expiradas
      const expiredEntries: string[] = [];
      this.cache.forEach((entry, key) => {
        if (now - entry.timestamp > this.maxAge) {
          expiredEntries.push(key);
          URL.revokeObjectURL(entry.url);
        }
      });
      expiredEntries.forEach(key => this.cache.delete(key));
      
      if (expiredEntries.length > 0 || expiredLocks.length > 0) {
        console.log('🕒 UnifiedMediaCache: Limpieza periódica:', {
          entradasExpiradas: expiredEntries.length,
          locksExpirados: expiredLocks.length,
          cacheActual: this.cache.size
        });
      }
    }, 5 * 60 * 1000); // Cada 5 minutos
  }

  /**
   * Obtiene el tamaño total del cache
   */
  private getCacheSize(): number {
    return Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  /**
   * Obtiene métricas expandidas del cache
   */
  getMetrics(): CacheMetrics & {
    cacheHitRate: string;
    cacheSizeMB: number;
    entries: number;
    preloadQueueSize: number;
    downloadingLocks: number;
    urlOptimizerStats: any;
    performanceInsights: any[];
  } {
    const hitRate = this.metrics.totalRequests > 0 
      ? Math.round((this.metrics.cacheHits / this.metrics.totalRequests) * 100) 
      : 0;
    
    return {
      ...this.metrics,
      cacheHitRate: `${hitRate}%`,
      cacheSizeMB: Math.round(this.getCacheSize() / 1024 / 1024 * 100) / 100,
      entries: this.cache.size,
      preloadQueueSize: this.preloadQueue.length,
      downloadingLocks: this.downloadingLocks.size,
      urlOptimizerStats: signedUrlOptimizer.getStats(),
      performanceInsights: performanceAnalyzer.analyzePerformance()
    };
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.forEach(entry => URL.revokeObjectURL(entry.url));
    this.cache.clear();
    this.downloadingLocks.clear();
    this.preloadQueue.length = 0;
    
    console.log('🗑️ UnifiedMediaCache: Cache completamente limpiado');
  }
}

// Singleton global
export const unifiedMediaCache = new UnifiedMediaCacheManager();
