
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
 * Hook para lazy loading inteligente con cancelación automática
 * Cancela descargas si el usuario se mueve rápidamente por el contenido
 */
export const useSmartLazyLoad = (
  onLoad: (signal: AbortSignal) => Promise<void>,
  options: UseSmartLazyLoadOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    enableCancellation = true,
    loadDelay = 500
  } = options;

  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const activeOperations = useRef<Map<string, LoadOperation>>(new Map());
  const loadTimeoutRef = useRef<NodeJS.Timeout>();
  const lastViewChangeRef = useRef<number>(Date.now());

  // Limpiar operaciones obsoletas
  const cleanupOperations = useCallback(() => {
    const now = Date.now();
    const operations = activeOperations.current;
    
    operations.forEach((operation, id) => {
      // Cancelar operaciones que llevan más de 10 segundos
      if (now - operation.timestamp > 10000) {
        console.log('🧹 SmartLazyLoad: Limpiando operación obsoleta:', id);
        operation.abortController.abort('cleanup');
        operations.delete(id);
      }
    });
  }, []);

  // Cancelar cargas rápidas si el usuario se mueve muy rápido
  const shouldCancelQuickMovement = useCallback(() => {
    if (!enableCancellation) return false;
    
    const now = Date.now();
    const timeSinceLastChange = now - lastViewChangeRef.current;
    
    // Si han pasado menos de 200ms desde el último cambio de vista, 
    // es probable que el usuario esté scrolleando rápido
    if (timeSinceLastChange < 200) {
      console.log('⚡ SmartLazyLoad: Movimiento rápido detectado, cancelando carga preventiva');
      return true;
    }
    
    return false;
  }, [enableCancellation]);

  // Función de carga con cancelación inteligente
  const performLoad = useCallback(async () => {
    if (isLoaded || isLoading) return;

    // Verificar si debemos cancelar por movimiento rápido
    if (shouldCancelQuickMovement()) {
      return;
    }

    console.log('🔄 SmartLazyLoad: Iniciando carga con cancelación inteligente');
    
    const operationId = `load_${Date.now()}_${Math.random()}`;
    const abortController = new AbortController();
    
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
        if (err.name === 'AbortError') {
          console.log('🚫 SmartLazyLoad: Carga abortada por signal');
        } else {
          console.error('❌ SmartLazyLoad: Error en carga:', err);
          setError(err);
        }
      }
    } finally {
      setIsLoading(false);
      activeOperations.current.delete(operationId);
    }
  }, [isLoaded, isLoading, onLoad, shouldCancelQuickMovement]);

  // Observer para detectar cuando el elemento entra en vista
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const inView = entry.isIntersecting;
        
        lastViewChangeRef.current = Date.now();
        setIsInView(inView);

        if (inView && !isLoaded && !isLoading) {
          // Delay para evitar cargas en scrolling rápido
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }

          loadTimeoutRef.current = setTimeout(() => {
            // Verificar si aún está en vista después del delay
            if (isInView && !isLoaded && !isLoading) {
              performLoad();
            }
          }, loadDelay);
        } else if (!inView) {
          // Cancelar carga pendiente si sale de vista
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }

          // Cancelar operaciones activas si está habilitada la cancelación
          if (enableCancellation && activeOperations.current.size > 0) {
            console.log('👁️ SmartLazyLoad: Elemento fuera de vista, cancelando operaciones');
            activeOperations.current.forEach((operation) => {
              operation.abortController.abort('out_of_view');
            });
            activeOperations.current.clear();
            setIsLoading(false);
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

  // Limpieza periódica de operaciones
  useEffect(() => {
    const interval = setInterval(cleanupOperations, 5000);
    return () => clearInterval(interval);
  }, [cleanupOperations]);

  // Función manual para forzar carga
  const forceLoad = useCallback(() => {
    if (!isLoaded) {
      performLoad();
    }
  }, [isLoaded, performLoad]);

  return {
    elementRef,
    isInView,
    isLoaded,
    isLoading,
    error,
    forceLoad,
    activeOperationsCount: activeOperations.current.size
  };
};
