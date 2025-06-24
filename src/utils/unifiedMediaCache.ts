
/**
 * Sistema de Cache Unificado Avanzado para optimización de transacciones Clase B
 * Reduce descargas duplicadas, implementa precarga inteligente y persistencia con IndexedDB
 */

interface CacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  priority: 'high' | 'medium' | 'low';
  size: number;
  type: 'avatar' | 'media' | 'general';
}

interface DownloadingLock {
  promise: Promise<string>;
  fileId: string;
  timestamp: number;
}

interface CacheMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  duplicatePrevented: number;
  totalBytesServed: number;
  totalBytesSaved: number;
  preloadHits: number;
}

interface PreloadItem {
  fileId: string;
  priority: 'high' | 'medium' | 'low';
  type: 'avatar' | 'media';
  fetchFunction: () => Promise<string>;
}

class UnifiedMediaCacheManager {
  private cache = new Map<string, CacheEntry>();
  private downloadingLocks = new Map<string, DownloadingLock>();
  private preloadQueue: PreloadItem[] = [];
  private isPreloading = false;
  private dbName = 'comicomi-media-cache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  
  // Configuración del cache
  private maxCacheSize = 100 * 1024 * 1024; // 100MB máximo
  private maxAge = 2 * 60 * 60 * 1000; // 2 horas
  private maxEntries = 200;
  private preloadBatchSize = 5;
  
  // Métricas
  private metrics: CacheMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    duplicatePrevented: 0,
    totalBytesServed: 0,
    totalBytesSaved: 0,
    preloadHits: 0
  };

  constructor() {
    this.initializeIndexedDB();
    this.startPeriodicCleanup();
    this.startPreloadProcessor();
    console.log('🚀 UnifiedMediaCache: Sistema de cache unificado inicializado');
  }

  /**
   * Inicializa IndexedDB para persistencia
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
        console.log('✅ UnifiedMediaCache: IndexedDB inicializado exitosamente');
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('mediaCache')) {
          const store = db.createObjectStore('mediaCache', { keyPath: 'fileId' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('type', 'type');
          store.createIndex('priority', 'priority');
        }
      };
    } catch (error) {
      console.warn('⚠️ UnifiedMediaCache: IndexedDB no disponible, usando cache en memoria');
    }
  }

  /**
   * Carga datos persistentes desde IndexedDB
   */
  private async loadFromIndexedDB(): Promise<void> {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction(['mediaCache'], 'readonly');
      const store = transaction.objectStore('mediaCache');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const entries = request.result;
        const now = Date.now();
        
        entries.forEach((entry: any) => {
          // Solo cargar entradas que no hayan expirado
          if (now - entry.timestamp < this.maxAge) {
            // Recrear blob desde ArrayBuffer
            const blob = new Blob([entry.blobData], { type: entry.blobType });
            const url = URL.createObjectURL(blob);
            
            this.cache.set(entry.fileId, {
              url,
              blob,
              timestamp: entry.timestamp,
              accessCount: entry.accessCount || 0,
              lastAccess: entry.lastAccess || entry.timestamp,
              priority: entry.priority || 'medium',
              size: entry.size || blob.size,
              type: entry.type || 'general'
            });
          }
        });
        
        console.log(`📦 UnifiedMediaCache: ${this.cache.size} entradas cargadas desde IndexedDB`);
      };
    } catch (error) {
      console.warn('⚠️ UnifiedMediaCache: Error cargando desde IndexedDB:', error);
    }
  }

  /**
   * Guarda entrada en IndexedDB
   */
  private async saveToIndexedDB(fileId: string, entry: CacheEntry): Promise<void> {
    if (!this.db) return;
    
    try {
      const arrayBuffer = await entry.blob.arrayBuffer();
      const transaction = this.db.transaction(['mediaCache'], 'readwrite');
      const store = transaction.objectStore('mediaCache');
      
      await store.put({
        fileId,
        timestamp: entry.timestamp,
        accessCount: entry.accessCount,
        lastAccess: entry.lastAccess,
        priority: entry.priority,
        size: entry.size,
        type: entry.type,
        blobData: arrayBuffer,
        blobType: entry.blob.type
      });
    } catch (error) {
      console.warn('⚠️ UnifiedMediaCache: Error guardando en IndexedDB:', error);
    }
  }

  /**
   * Obtiene archivo con cache unificado y downloading locks
   */
  async get(
    fileId: string,
    fetchFunction: () => Promise<string>,
    options: {
      type?: 'avatar' | 'media' | 'general';
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<string> {
    const { type = 'general', priority = 'medium' } = options;
    const cacheKey = `unified_${fileId}`;
    
    this.metrics.totalRequests++;
    
    console.log('🔍 UnifiedMediaCache: Solicitando archivo:', {
      fileId: fileId.substring(0, 30) + '...',
      type,
      priority,
      cacheSize: this.cache.size
    });
    
    // Verificar cache existente
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      cached.accessCount++;
      cached.lastAccess = Date.now();
      this.metrics.cacheHits++;
      this.metrics.totalBytesServed += cached.size;
      this.metrics.totalBytesSaved += cached.size; // Bytes ahorrados por no descargar
      
      console.log('🎯 UnifiedMediaCache: Cache HIT:', {
        fileId: fileId.substring(0, 30) + '...',
        accessCount: cached.accessCount,
        sizeMB: Math.round(cached.size / 1024 / 1024 * 100) / 100
      });
      
      return cached.url;
    }
    
    // Verificar downloading lock para evitar duplicados
    const existingLock = this.downloadingLocks.get(fileId);
    if (existingLock) {
      this.metrics.duplicatePrevented++;
      
      console.log('🔒 UnifiedMediaCache: Download lock activo, esperando...', {
        fileId: fileId.substring(0, 30) + '...',
        duplicatesPrevented: this.metrics.duplicatePrevented
      });
      
      return await existingLock.promise;
    }
    
    // Crear downloading lock
    const downloadPromise = this.performDownload(fileId, fetchFunction, type, priority);
    this.downloadingLocks.set(fileId, {
      promise: downloadPromise,
      fileId,
      timestamp: Date.now()
    });
    
    try {
      const result = await downloadPromise;
      return result;
    } finally {
      // Limpiar lock
      this.downloadingLocks.delete(fileId);
    }
  }

  /**
   * Realiza la descarga y cachea el resultado
   */
  private async performDownload(
    fileId: string,
    fetchFunction: () => Promise<string>,
    type: 'avatar' | 'media' | 'general',
    priority: 'high' | 'medium' | 'low'
  ): Promise<string> {
    const cacheKey = `unified_${fileId}`;
    
    try {
      console.log('📥 UnifiedMediaCache: Iniciando descarga:', {
        fileId: fileId.substring(0, 30) + '...',
        type,
        priority
      });
      
      // Obtener URL firmada
      const signedUrl = await fetchFunction();
      
      // Descargar archivo
      const response = await fetch(signedUrl);
      if (!response.ok) {
        throw new Error(`Error descargando: ${response.status}`);
      }
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Crear entrada de cache
      const entry: CacheEntry = {
        url: objectUrl,
        blob,
        timestamp: Date.now(),
        accessCount: 1,
        lastAccess: Date.now(),
        priority,
        size: blob.size,
        type
      };
      
      // Guardar en cache
      this.cache.set(cacheKey, entry);
      
      // Guardar en IndexedDB
      this.saveToIndexedDB(cacheKey, entry);
      
      // Actualizar métricas
      this.metrics.cacheMisses++;
      this.metrics.totalBytesServed += blob.size;
      
      // Limpiar cache si es necesario
      this.enforceMemoryLimits();
      
      console.log('✅ UnifiedMediaCache: Descarga y cache exitosos:', {
        fileId: fileId.substring(0, 30) + '...',
        sizeMB: Math.round(blob.size / 1024 / 1024 * 100) / 100,
        cacheSize: this.cache.size,
        hitRate: Math.round((this.metrics.cacheHits / this.metrics.totalRequests) * 100) + '%'
      });
      
      return objectUrl;
      
    } catch (error) {
      console.error('❌ UnifiedMediaCache: Error en descarga:', error);
      // Fallback a URL firmada directa
      return await fetchFunction();
    }
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
      fetchFunction
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
   * Obtiene métricas del cache
   */
  getMetrics(): CacheMetrics & {
    cacheHitRate: string;
    cacheSizeMB: number;
    entries: number;
    preloadQueueSize: number;
    downloadingLocks: number;
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
      downloadingLocks: this.downloadingLocks.size
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
