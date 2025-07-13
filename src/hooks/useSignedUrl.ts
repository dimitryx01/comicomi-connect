import { useState, useEffect, useRef, useCallback } from 'react';
import { getSignedMediaUrl } from '@/utils/mediaStorage';
import { b2TransactionMonitor } from '@/utils/B2TransactionMonitor';
import { optimizedB2Cache } from '@/utils/OptimizedB2Cache';

interface UseSignedUrlReturn {
  signedUrl: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
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
  
  // Usar una ref para evitar logs duplicados
  const requestInProgress = useRef(false);
  const lastFileId = useRef<string | null | undefined>(null);
  const lastUrl = useRef<string | null>(null);
  
  const fetchSignedUrl = useCallback(async () => {
    if (!fileId || !enabled || requestInProgress.current) {
      return;
    }
    
    // Si ya tenemos una URL para este fileId, no volvemos a solicitarla
    if (lastUrl.current && fileId === lastFileId.current) {
      return;
    }
    
    requestInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      // Usar cache optimizado para evitar transacciones redundantes
      const cacheKey = `hook_signed_url_${fileId}_${expiresIn}`;
      
      const url = await optimizedB2Cache.get(cacheKey, async () => {
        // Solo registrar transacciu00f3n cuando hay cache miss
        b2TransactionMonitor.logTransactionB(component, 'hook_signed_url', fileId, 'hook_cache_miss');
        return await getSignedMediaUrl(fileId, expiresIn);
      }, {
        component,
        ttl: Math.min(expiresIn * 1000, 25 * 60 * 1000), // TTL un poco menor para seguridad
        priority: 'high'
      });

      setSignedUrl(url);
      lastFileId.current = fileId;
      lastUrl.current = url;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setSignedUrl(null);
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }, [fileId, expiresIn, component, enabled]);

  useEffect(() => {
    if (!fileId || !enabled) {
      setSignedUrl(null);
      setLoading(false);
      setError(null);
      return;
    }
    
    fetchSignedUrl();
  }, [fileId, enabled, fetchSignedUrl]);

  return {
    signedUrl,
    loading,
    error,
    refresh: fetchSignedUrl
  };
};