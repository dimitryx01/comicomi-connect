
import { useRef, useEffect, useState, useCallback } from 'react';

interface UseSmartLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  enableCancellation?: boolean;
  loadDelay?: number;
}

interface LoadOperation {
  id: string;
  timestamp: number;
  abortController: AbortController;
}

/**
 * Hook para lazy loading inteligente con cancelación configurable
 * Versión optimizada para reducir cancelaciones prematuras
 */
export const useSmartLazyLoad = (
  onLoad: (signal: AbortSignal) => Promise<void>,
  options: UseSmartLazyLoadOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    enableCancellation = false, // Cambiado a false por defecto
    loadDelay = 100 // Reducido para mejor responsividad
  } = options;

  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const activeOperations = useRef<Map<string, LoadOperation>>(new Map());
  const loadTimeoutRef = useRef<NodeJS.Timeout>();
  const lastViewChangeRef = useRef<number>(Date.now());
  const hasAttemptedLoad = useRef<boolean>(false);

  // Limpiar operaciones obsoletas con timeout más generoso
  const cleanupOperations = useCallback(() => {
    const now = Date.now();
    const operations = activeOperations.current;
    
    operations.forEach((operation, id) => {
      // Cancelar operaciones que llevan más de 30 segundos (aumentado)
      if (now - operation.timestamp > 30000) {
        console.log('🧹 SmartLazyLoad: Limpiando operación obsoleta:', id);
        operation.abortController.abort('cleanup');
        operations.delete(id);
      }
    });
  }, []);

  // Cancelación más inteligente - solo en movimientos muy rápidos
  const shouldCancelQuickMovement = useCallback(() => {
    if (!enableCancellation) return false;
    
    const now = Date.now();
    const timeSinceLastChange = now - lastViewChangeRef.current;
    
    // Solo cancelar si el movimiento es extremadamente rápido (menos de 50ms)
    if (timeSinceLastChange < 50 && !hasAttemptedLoad.current) {
      console.log('⚡ SmartLazyLoad: Movimiento extremadamente rápido detectado');
      return true;
    }
    
    return false;
  }, [enableCancellation]);

  // Función de carga optimizada
  const performLoad = useCallback(async () => {
    if (isLoaded || isLoading || hasAttemptedLoad.current) return;

    // Verificar cancelación solo si está habilitada
    if (shouldCancelQuickMovement()) {
      console.log('🚫 SmartLazyLoad: Carga cancelada por movimiento rápido');
      return;
    }

    console.log('🔄 SmartLazyLoad: Iniciando carga optimizada');
    
    const operationId = `load_${Date.now()}_${Math.random()}`;
    const abortController = new AbortController();
    
    // Marcar que hemos intentado cargar
    hasAttemptedLoad.current = true;
    
    // Registrar operación activa
    activeOperations.current.set(operationId, {
      id: operationId,
      timestamp: Date.now(),
      abortController
    });

    setIsLoading(true);
    setError(null);

    try {
      await onLoad(abortController.signal);
      
      // Solo marcar como cargado si no fue cancelado
      if (!abortController.signal.aborted) {
        setIsLoaded(true);
        console.log('✅ SmartLazyLoad: Carga completada exitosamente');
      } else {
        console.log('🚫 SmartLazyLoad: Carga cancelada');
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message.includes('cancelled')) {
          console.log('🚫 SmartLazyLoad: Carga abortada por signal');
        } else {
          console.error('❌ SmartLazyLoad: Error en carga:', {
            message: err.message,
            name: err.name,
            stack: err.stack
          });
          setError(err);
        }
      }
    } finally {
      setIsLoading(false);
      activeOperations.current.delete(operationId);
    }
  }, [isLoaded, isLoading, onLoad, shouldCancelQuickMovement]);

  // Observer más permisivo
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const inView = entry.isIntersecting;
        
        lastViewChangeRef.current = Date.now();
        setIsInView(inView);

        if (inView && !isLoaded && !isLoading && !hasAttemptedLoad.current) {
          // Delay mínimo para evitar cargas en scrolling muy rápido
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }

          loadTimeoutRef.current = setTimeout(() => {
            // Verificar si aún está en vista después del delay
            if (isInView && !isLoaded && !isLoading) {
              performLoad();
            }
          }, loadDelay);
        } else if (!inView && enableCancellation) {
          // Solo cancelar si la cancelación está explícitamente habilitada
          // Y solo si no hemos cargado exitosamente
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }

          if (activeOperations.current.size > 0 && !isLoaded) {
            console.log('👁️ SmartLazyLoad: Elemento fuera de vista, cancelando operaciones pendientes');
            activeOperations.current.forEach((operation) => {
              operation.abortController.abort('out_of_view');
            });
            activeOperations.current.clear();
            setIsLoading(false);
            // No resetear hasAttemptedLoad para evitar reintentos infinitos
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      // Cancelar operaciones activas al desmontar
      activeOperations.current.forEach((operation) => {
        operation.abortController.abort('unmount');
      });
      activeOperations.current.clear();
    };
  }, [threshold, rootMargin, isInView, isLoaded, isLoading, performLoad, enableCancellation, loadDelay]);

  // Limpieza periódica menos frecuente
  useEffect(() => {
    const interval = setInterval(cleanupOperations, 15000); // Cada 15 segundos
    return () => clearInterval(interval);
  }, [cleanupOperations]);

  // Función manual para forzar carga
  const forceLoad = useCallback(() => {
    if (!isLoaded) {
      hasAttemptedLoad.current = false; // Resetear para permitir nuevo intento
      performLoad();
    }
  }, [isLoaded, performLoad]);

  // Función para resetear el estado
  const resetLoad = useCallback(() => {
    hasAttemptedLoad.current = false;
    setIsLoaded(false);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    elementRef,
    isInView,
    isLoaded,
    isLoading,
    error,
    forceLoad,
    resetLoad,
    activeOperationsCount: activeOperations.current.size
  };
};
