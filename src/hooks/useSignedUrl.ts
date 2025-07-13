import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getSignedMediaUrl } from '@/utils/mediaStorage';
import { b2TransactionMonitor } from '@/utils/B2TransactionMonitor';
import { optimizedB2Cache } from '@/utils/OptimizedB2Cache';
import { logger } from '@/utils/logConfig';

interface UseSignedUrlReturn {
  signedUrl: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Cache global para evitar solicitudes duplicadas entre componentes
const globalUrlCache = new Map<string, string>();

export const useSignedUrl = (
  fileId: string | null | undefined,
  options: {
    expiresIn?: number;
    component?: string;
    enabled?: boolean;
  } = {}
): UseSignedUrlReturn => {
  const { expiresIn = 3600, component = 'useSignedUrl', enabled = true } = options;
  
  const [signedUrl, setSignedUrl] = useState<string | null>(() => {
    // Inicializar desde el cache global si existe
    if (fileId && globalUrlCache.has(fileId)) {
      return globalUrlCache.get(fileId) || null;
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Usar una ref para evitar solicitudes duplicadas
  const requestInProgressRef = useRef(false);
  
  // Memoize fileId para evitar re-renderizados innecesarios
  const memoizedFileId = useMemo(() => fileId, [fileId]);
  
  const fetchSignedUrl = useCallback(async () => {
    if (!memoizedFileId || !enabled || requestInProgressRef.current) {
      return;
    }
    
    // Si ya tenemos una URL en el cache global, usarla
    if (globalUrlCache.has(memoizedFileId)) {
      const cachedUrl = globalUrlCache.get(memoizedFileId);
      if (cachedUrl) {
        setSignedUrl(cachedUrl);
        return;
      }
    }
    
    requestInProgressRef.current = true;
    setLoading(true);
    setError(null);

    try {
      logger.log('useSignedUrl', `Fetching signed URL for ${memoizedFileId}`);
      
      // Usar cache optimizado para evitar transacciones redundantes
      const cacheKey = `hook_signed_url_${memoizedFileId}_${expiresIn}`;
      
      const url = await optimizedB2Cache.get(cacheKey, async () => {
        // Solo registrar transacciu00f3n cuando hay cache miss
        b2TransactionMonitor.logTransactionB(component, 'hook_signed_url', memoizedFileId, 'hook_cache_miss');
        return await getSignedMediaUrl(memoizedFileId, expiresIn);
      }, {
        component,
        ttl: Math.min(expiresIn * 1000, 25 * 60 * 1000), // TTL un poco menor para seguridad
        priority: 'high'
      });

      // Guardar en el cache global
      globalUrlCache.set(memoizedFileId, url);
      setSignedUrl(url);
      logger.log('useSignedUrl', `Signed URL fetched for ${memoizedFileId}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      logger.error('useSignedUrl', `Error fetching signed URL for ${memoizedFileId}`, err);
      setError(errorMessage);
      setSignedUrl(null);
    } finally {
      setLoading(false);
      requestInProgressRef.current = false;
    }
  }, [memoizedFileId, expiresIn, component, enabled]);

  useEffect(() => {
    if (!memoizedFileId || !enabled) {
      setSignedUrl(null);
      setLoading(false);
      setError(null);
      return;
    }
    
    // Si ya tenemos una URL en el cache global, usarla inmediatamente
    if (globalUrlCache.has(memoizedFileId)) {
      const cachedUrl = globalUrlCache.get(memoizedFileId);
      if (cachedUrl) {
        setSignedUrl(cachedUrl);
        return;
      }
    }
    
    fetchSignedUrl();
    
    return () => {
      // No es necesario limpiar nada aquu00ed
    };
  }, [memoizedFileId, enabled, fetchSignedUrl]);

  return {
    signedUrl,
    loading,
    error,
    refresh: fetchSignedUrl
  };
};