
import { useState, useEffect } from 'react';
import { getSignedMediaUrl } from '@/utils/mediaStorage';

/**
 * Hook personalizado para URLs firmadas con cache automático
 */
export const useSignedUrl = (fileId: string | null | undefined) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) {
      setSignedUrl(null);
      setError(null);
      return;
    }

    let isCancelled = false;

    const fetchSignedUrl = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const url = await getSignedMediaUrl(fileId);
        if (!isCancelled) {
          setSignedUrl(url);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
          setSignedUrl(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchSignedUrl();

    return () => {
      isCancelled = true;
    };
  }, [fileId]);

  return { signedUrl, loading, error };
};
