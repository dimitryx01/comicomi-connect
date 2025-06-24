/**
 * Sistema de Cache Universal para Imágenes
 * 
 * Propósito: Cache inteligente y persistente para todas las imágenes de la plataforma
 * - Reduce transacciones B mediante almacenamiento local
 * - Usa IndexedDB para persistencia
 * - Soporte para invalidación y limpieza
 * 
 * Uso básico:
 * ```typescript
 * import { universalImageCache } from '@/utils/UniversalImageCache';
 * 
 * // Obtener imagen (desde cache o descarga)
 * const imageUrl = await universalImageCache.getImage(fileId, fetchFunction);
 * 
 * // Limpiar cache específico
 * await universalImageCache.removeImage(fileId);
 * 
 * // Limpiar todo el cache
 * await universalImageCache.clearAll();
 * ```
 */

interface CacheEntry {
  fileId: string;
  blob: Blob;
  url: string;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  size: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  cacheSize: number;
  entriesCount: number;
}

class UniversalImageCache {
  private dbName = 'universal-image-cache';
  private dbVersion = 1;
  private storeName = 'images';
  private db: IDBDatabase | null = null;
  private memoryCache = new Map<string, CacheEntry>();
  private maxMemoryEntries = 100;
  private maxAgeMs = 24 * 60 * 60 * 1000; // 24 horas
  
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    cacheSize: 0,
    entriesCount: 0
  };

  constructor() {
    this.initializeDB();
    this.startPeriodicCleanup();
  }

  /**
   * Inicializa la base de datos IndexedDB
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.warn('🚨 UniversalImageCache: Error inicializando IndexedDB, funcionando solo en memoria');
        resolve(); // Continuar sin IndexedDB
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.loadMemoryCache();
        console.log('✅ UniversalImageCache: IndexedDB inicializado correctamente');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'fileId' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('lastAccess', 'lastAccess');
        }
      };
    });
  }

  /**
   * Valida si un fileId es válido antes de procesarlo
   */
  private isValidFileId(fileId: string | null | undefined): boolean {
    if (!fileId || typeof fileId !== 'string') {
      return false;
    }
    
    const trimmed = fileId.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
      return false;
    }
    
    return true;
  }

  /**
   * Valida si una URL de descarga es válida
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Carga las entradas más recientes en memoria
   */
  private async loadMemoryCache(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore('images');
      const index = store.index('lastAccess');
      const request = index.openCursor(null, 'prev');

      let loadedCount = 0;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor && loadedCount < this.maxMemoryEntries) {
          const entry = cursor.value;
          
          // Verificar que no esté expirado
          const isExpired = Date.now() - entry.timestamp > this.maxAgeMs;
          
          if (!isExpired) {
            // Recrear blob y URL
            const blob = new Blob([entry.blobData], { type: entry.blobType });
            const url = URL.createObjectURL(blob);
            
            this.memoryCache.set(entry.fileId, {
              ...entry,
              blob,
              url
            });
            
            loadedCount++;
          }
          
          cursor.continue();
        } else {
          console.log(`📦 UniversalImageCache: ${loadedCount} entradas cargadas en memoria`);
        }
      };
    } catch (error) {
      console.warn('⚠️ UniversalImageCache: Error cargando cache en memoria:', error);
    }
  }

  /**
   * Obtiene una imagen del cache o la descarga
   */
  async getImage(
    fileId: string | null | undefined, 
    fetchFunction: (() => Promise<string>) | null | undefined
  ): Promise<string> {
    this.metrics.totalRequests++;
    
    // Validar fileId
    if (!this.isValidFileId(fileId)) {
      console.warn('⚠️ UniversalImageCache: fileId inválido:', fileId);
      throw new Error('FileId inválido o vacío');
    }

    // Validar fetchFunction
    if (!fetchFunction || typeof fetchFunction !== 'function') {
      console.warn('⚠️ UniversalImageCache: fetchFunction inválida para fileId:', fileId);
      throw new Error('Función de descarga no disponible');
    }

    const validFileId = fileId!.trim();
    
    console.log('🔍 UniversalImageCache: Solicitando imagen:', {
      fileId: validFileId.substring(0, 50) + '...',
      hasFetchFunction: !!fetchFunction
    });

    // 1. Verificar cache en memoria
    const memoryCached = this.memoryCache.get(validFileId);
    if (memoryCached && this.isEntryValid(memoryCached)) {
      memoryCached.accessCount++;
      memoryCached.lastAccess = Date.now();
      this.metrics.hits++;
      
      console.log('🎯 UniversalImageCache: Cache HIT en memoria:', {
        fileId: validFileId.substring(0, 30) + '...',
        accessCount: memoryCached.accessCount
      });
      
      // Actualizar IndexedDB async
      this.updateIndexedDBEntry(memoryCached);
      
      return memoryCached.url;
    }

    // 2. Verificar IndexedDB
    const dbCached = await this.getFromIndexedDB(validFileId);
    if (dbCached && this.isEntryValid(dbCached)) {
      // Recrear URL y añadir a memoria
      const url = URL.createObjectURL(dbCached.blob);
      const entry: CacheEntry = {
        ...dbCached,
        url,
        accessCount: dbCached.accessCount + 1,
        lastAccess: Date.now()
      };
      
      this.addToMemoryCache(validFileId, entry);
      this.metrics.hits++;
      
      console.log('🎯 UniversalImageCache: Cache HIT en IndexedDB:', {
        fileId: validFileId.substring(0, 30) + '...'
      });
      
      return url;
    }

    // 3. Descargar imagen
    this.metrics.misses++;
    console.log('📥 UniversalImageCache: Descargando imagen desde red...');
    
    try {
      // Obtener URL firmada
      const signedUrl = await fetchFunction();
      
      console.log('🔗 UniversalImageCache: URL firmada obtenida:', {
        fileId: validFileId.substring(0, 30) + '...',
        urlValid: this.isValidUrl(signedUrl),
        urlPrefix: signedUrl.substring(0, 50) + '...'
      });
      
      if (!this.isValidUrl(signedUrl)) {
        throw new Error(`URL firmada inválida: ${signedUrl}`);
      }
      
      // Descargar imagen
      const response = await fetch(signedUrl);
      
      console.log('📡 UniversalImageCache: Respuesta de descarga:', {
        fileId: validFileId.substring(0, 30) + '...',
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      if (!blob || blob.size === 0) {
        throw new Error('Blob vacío o inválido');
      }
      
      const url = URL.createObjectURL(blob);
      
      const entry: CacheEntry = {
        fileId: validFileId,
        blob,
        url,
        timestamp: Date.now(),
        accessCount: 1,
        lastAccess: Date.now(),
        size: blob.size
      };
      
      // Guardar en ambos caches
      this.addToMemoryCache(validFileId, entry);
      this.saveToIndexedDB(entry);
      
      console.log('✅ UniversalImageCache: Imagen descargada y cacheada:', {
        fileId: validFileId.substring(0, 30) + '...',
        sizeMB: Math.round(blob.size / 1024 / 1024 * 100) / 100
      });
      
      return url;
      
    } catch (error) {
      console.error('❌ UniversalImageCache: Error descargando imagen:', {
        fileId: validFileId.substring(0, 30) + '...',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Guarda una imagen manualmente en el cache
   */
  async setImage(fileId: string, blob: Blob): Promise<string> {
    const url = URL.createObjectURL(blob);
    
    const entry: CacheEntry = {
      fileId,
      blob,
      url,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
      size: blob.size
    };
    
    this.addToMemoryCache(fileId, entry);
    await this.saveToIndexedDB(entry);
    
    console.log('💾 UniversalImageCache: Imagen guardada manualmente:', {
      fileId: fileId.substring(0, 30) + '...'
    });
    
    return url;
  }

  private isEntryValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.maxAgeMs;
  }

  private addToMemoryCache(fileId: string, entry: CacheEntry): void {
    // Si está lleno, eliminar el menos usado
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      const leastUsed = Array.from(this.memoryCache.entries())
        .sort(([,a], [,b]) => a.lastAccess - b.lastAccess)[0];
      
      if (leastUsed) {
        URL.revokeObjectURL(leastUsed[1].url);
        this.memoryCache.delete(leastUsed[0]);
      }
    }
    
    this.memoryCache.set(fileId, entry);
  }

  private async getFromIndexedDB(fileId: string): Promise<CacheEntry | null> {
    if (!this.db) return null;
    
    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(fileId);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            const blob = new Blob([result.blobData], { type: result.blobType });
            resolve({
              ...result,
              blob
            });
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.warn('⚠️ UniversalImageCache: Error leyendo IndexedDB:', error);
      return null;
    }
  }

  private async saveToIndexedDB(entry: CacheEntry): Promise<void> {
    if (!this.db) return;
    
    try {
      const arrayBuffer = await entry.blob.arrayBuffer();
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await store.put({
        fileId: entry.fileId,
        timestamp: entry.timestamp,
        accessCount: entry.accessCount,
        lastAccess: entry.lastAccess,
        size: entry.size,
        blobData: arrayBuffer,
        blobType: entry.blob.type
      });
    } catch (error) {
      console.warn('⚠️ UniversalImageCache: Error guardando en IndexedDB:', error);
    }
  }

  private async updateIndexedDBEntry(entry: CacheEntry): Promise<void> {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(entry.fileId);
      
      request.onsuccess = () => {
        const existingEntry = request.result;
        if (existingEntry) {
          existingEntry.accessCount = entry.accessCount;
          existingEntry.lastAccess = entry.lastAccess;
          store.put(existingEntry);
        }
      };
    } catch (error) {
      console.warn('⚠️ UniversalImageCache: Error actualizando IndexedDB:', error);
    }
  }

  /**
   * Elimina una imagen específica del cache
   */
  async removeImage(fileId: string): Promise<void> {
    if (!this.isValidFileId(fileId)) return;
    
    const validFileId = fileId.trim();
    
    // Eliminar de memoria
    const memoryEntry = this.memoryCache.get(validFileId);
    if (memoryEntry) {
      URL.revokeObjectURL(memoryEntry.url);
      this.memoryCache.delete(validFileId);
    }
    
    // Eliminar de IndexedDB
    await this.removeFromIndexedDB(validFileId);
    
    console.log('🗑️ UniversalImageCache: Imagen eliminada del cache:', {
      fileId: validFileId.substring(0, 30) + '...'
    });
  }

  private async removeFromIndexedDB(fileId: string): Promise<void> {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.delete(fileId);
    } catch (error) {
      console.warn('⚠️ UniversalImageCache: Error eliminando de IndexedDB:', error);
    }
  }

  /**
   * Limpia todo el cache
   */
  async clearAll(): Promise<void> {
    // Limpiar memoria
    this.memoryCache.forEach(entry => URL.revokeObjectURL(entry.url));
    this.memoryCache.clear();
    
    // Limpiar IndexedDB
    await this.clearIndexedDB();
    
    // Resetear métricas
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      cacheSize: 0,
      entriesCount: 0
    };
    
    console.log('🧹 UniversalImageCache: Cache completamente limpiado');
  }

  private async clearIndexedDB(): Promise<void> {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.clear();
    } catch (error) {
      console.warn('⚠️ UniversalImageCache: Error limpiando IndexedDB:', error);
    }
  }

  /**
   * Obtiene métricas del cache
   */
  getMetrics(): CacheMetrics & { hitRate: string } {
    const hitRate = this.metrics.totalRequests > 0 
      ? Math.round((this.metrics.hits / this.metrics.totalRequests) * 100) 
      : 0;
    
    return {
      ...this.metrics,
      cacheSize: this.getTotalCacheSize(),
      entriesCount: this.memoryCache.size,
      hitRate: `${hitRate}%`
    };
  }

  private getTotalCacheSize(): number {
    return Array.from(this.memoryCache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  private startPeriodicCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredEntries: string[] = [];
      
      this.memoryCache.forEach((entry, fileId) => {
        if (now - entry.timestamp > this.maxAgeMs) {
          expiredEntries.push(fileId);
          URL.revokeObjectURL(entry.url);
        }
      });
      
      expiredEntries.forEach(fileId => this.memoryCache.delete(fileId));
      
      if (expiredEntries.length > 0) {
        console.log(`🕒 UniversalImageCache: ${expiredEntries.length} entradas expiradas eliminadas`);
      }
    }, 10 * 60 * 1000); // Cada 10 minutos
  }
}

// Singleton global
export const universalImageCache = new UniversalImageCache();
