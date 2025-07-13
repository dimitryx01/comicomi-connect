
import { useState, useEffect, useCallback, useRef } from 'react';
import { getSignedMediaUrl } from '@/utils/mediaStorage';
import { b2TransactionMonitor } from '@/utils/B2TransactionMonitor';
import { optimizedB2Cache } from '@/utils/OptimizedB2Cache';

interface UseSignedUrlReturn {
  signedUrl: string | null;
  loading: boolean;
  error: string | null;
}

export const useSignedUrl = (
  fileId: string | null | undefined,
  options: {
    expiresIn?: number;
    component?: string;
    enabled?: boolean;
  } = {}
): UseSignedUrlReturn => {
  const { expiresIn = 3600, component = 'useSignedUrl', enabled = true } = options;
  
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Usar ref para evitar múltiples fetches del mismo fileId
  const currentRequestRef = useRef<string | null>(null);

  const fetchSignedUrl = useCallback(async (targetFileId: string) => {
    // Prevenir múltiples requests del mismo archivo
    if (currentRequestRef.current === targetFileId) {
      return;
    }
    currentRequestRef.current = targetFileId;
    setLoading(true);
    setError(null);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 useSignedUrl: Solicitando URL firmada optimizada:', {
          fileId: targetFileId.substring(0, 30) + '...',
          component,
          expiresIn
        });
      }

      // Usar cache optimizado para evitar transacciones redundantes
      const cacheKey = `hook_signed_url_${targetFileId}_${expiresIn}`;
      
      const url = await optimizedB2Cache.get(cacheKey, async () => {
        // Solo registrar transacción cuando hay cache miss
        b2TransactionMonitor.logTransactionB(component, 'hook_signed_url', targetFileId, 'hook_cache_miss');
        return await getSignedMediaUrl(targetFileId, expiresIn);
      }, {
        component,
        ttl: Math.min(expiresIn * 1000, 25 * 60 * 1000), // TTL un poco menor para seguridad
        priority: 'high'
      });

      setSignedUrl(url);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ useSignedUrl: URL firmada obtenida exitosamente:', {
          fileId: targetFileId.substring(0, 30) + '...',
          hasUrl: !!url,
          component
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ useSignedUrl: Error obteniendo URL firmada:', {
        fileId: targetFileId ? targetFileId.substring(0, 30) + '...' : 'no fileId',
        component,
        error: errorMessage
      });
      setError(errorMessage);
      setSignedUrl(null);
    } finally {
      setLoading(false);
      currentRequestRef.current = null;
    }
  }, [component, expiresIn]);

  useEffect(() => {
    if (!fileId || !enabled) {
      setSignedUrl(null);
      setLoading(false);
      setError(null);
      currentRequestRef.current = null;
      return;
    }

    fetchSignedUrl(fileId);
  }, [fileId, enabled, fetchSignedUrl]);

  return {
    signedUrl,
    loading,
    error
  };
};
