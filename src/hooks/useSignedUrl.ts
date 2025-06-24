
import { useState, useEffect } from 'react';
import { getSignedMediaUrl } from '@/utils/mediaStorage';

// Función para determinar si es una URL pública o un fileId privado
const isPublicUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Hook simple para URLs firmadas con cache básico
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

    // Si es una URL pública, usarla directamente
    if (isPublicUrl(fileId)) {
      console.log('🌐 useSignedUrl: Es URL pública, usando directamente:', fileId);
      setSignedUrl(fileId);
      setError(null);
      return;
    }

    let isCancelled = false;

    const fetchSignedUrl = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('📡 useSignedUrl: Obteniendo URL firmada para fileId:', fileId);
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
