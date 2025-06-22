
/**
 * Utilidades para cálculo de hash de archivos
 * Permite deduplicación y evita subidas innecesarias
 */

/**
 * Calcula el hash SHA-256 de un archivo
 */
export const calculateFileHash = async (file: File): Promise<string> => {
  try {
    console.log('🔐 fileHashing: Calculando hash para archivo:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log('✅ fileHashing: Hash calculado:', {
      fileName: file.name,
      fileSize: file.size,
      hash: hashHex.substring(0, 16) + '...' // Solo mostrar primeros 16 caracteres en log
    });
    
    return hashHex;
  } catch (error) {
    console.error('❌ fileHashing: Error calculando hash:', error);
    throw new Error('Error calculando hash del archivo');
  }
};

/**
 * Genera un nombre de archivo único basado en hash y metadatos
 */
export const generateHashBasedFileName = (
  hash: string, 
  originalName: string, 
  folder: string = 'general'
): string => {
  const extension = originalName.split('.').pop() || 'jpg';
  const shortHash = hash.substring(0, 12); // Usar primeros 12 caracteres del hash
  const timestamp = Date.now();
  
  return `${folder}/${timestamp}_${shortHash}.${extension}`;
};

/**
 * Cache simple en memoria para hashes calculados (evita recalcular)
 */
class FileHashCache {
  private cache = new Map<string, string>();
  private maxSize = 100; // Máximo 100 hashes en cache

  generateKey(file: File): string {
    return `${file.name}_${file.size}_${file.lastModified}`;
  }

  get(file: File): string | null {
    const key = this.generateKey(file);
    return this.cache.get(key) || null;
  }

  set(file: File, hash: string): void {
    const key = this.generateKey(file);
    
    // Si el cache está lleno, eliminar el más antiguo
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, hash);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const fileHashCache = new FileHashCache();

/**
 * Calcula hash con cache para evitar recálculos innecesarios
 */
export const calculateFileHashWithCache = async (file: File): Promise<string> => {
  // Verificar cache primero
  const cachedHash = fileHashCache.get(file);
  if (cachedHash) {
    console.log('💾 fileHashing: Hash encontrado en cache:', file.name);
    return cachedHash;
  }

  // Calcular hash y guardarlo en cache
  const hash = await calculateFileHash(file);
  fileHashCache.set(file, hash);
  
  return hash;
};
