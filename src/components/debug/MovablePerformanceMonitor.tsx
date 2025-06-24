
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Minimize2, Maximize2, Move, BarChart3 } from "lucide-react";
import { performanceAnalyzer } from '@/utils/performanceAnalyzer';
import { unifiedMediaCache } from '@/utils/unifiedMediaCache';

interface Position {
  x: number;
  y: number;
}

export const MovablePerformanceMonitor = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [stats, setStats] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  
  const monitorRef = useRef<HTMLDivElement>(null);

  // Actualizar estadísticas cada 5 segundos
  useEffect(() => {
    const updateStats = () => {
      try {
        const performanceStats = performanceAnalyzer.getDetailedStats();
        const cacheMetrics = unifiedMediaCache.getMetrics(); // Fixed: Changed from getStats() to getMetrics()
        setStats(performanceStats);
        setCacheStats(cacheMetrics);
      } catch (error) {
        console.warn('Error obteniendo estadísticas:', error);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Manejo de arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragStart.y));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full p-2"
        size="sm"
        variant="outline"
      >
        <BarChart3 className="h-4 w-4" />
      </Button>
    );
  }

  const getStatusColor = (value: number, threshold: number, inverse = false) => {
    const isGood = inverse ? value < threshold : value > threshold;
    return isGood ? 'bg-green-500' : value === 0 ? 'bg-gray-500' : 'bg-red-500';
  };

  return (
    <div
      ref={monitorRef}
      className="fixed z-50 select-none"
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 'auto' : '320px'
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="bg-white/95 backdrop-blur-sm border-2 shadow-lg">
        <CardHeader className="pb-2 cursor-move drag-handle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-sm">Performance Monitor</CardTitle>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="space-y-3 text-xs">
            {/* Performance Stats */}
            {stats && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Performance</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Operaciones:</span>
                      <Badge variant="outline" className="text-xs">
                        {stats.totalOperations}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Éxito:</span>
                      <Badge 
                        className={`text-xs text-white ${getStatusColor(stats.successRate, 0.8)}`}
                      >
                        {Math.round(stats.successRate * 100)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Promedio:</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(stats.averageDuration)}ms
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache Hit:</span>
                      <Badge 
                        className={`text-xs text-white ${getStatusColor(stats.cacheHitRate, 0.7)}`}
                      >
                        {Math.round(stats.cacheHitRate * 100)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cache Stats */}
            {cacheStats && (
              <div className="space-y-2 border-t pt-2">
                <h4 className="font-medium text-sm">Cache Unificado</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Entradas:</span>
                      <Badge variant="outline" className="text-xs">
                        {cacheStats.entries}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Hits:</span>
                      <Badge 
                        className={`text-xs text-white ${getStatusColor(cacheStats.cacheHits / (cacheStats.totalRequests || 1), 0.7)}`}
                      >
                        {Math.round((cacheStats.cacheHits / (cacheStats.totalRequests || 1)) * 100)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Memoria:</span>
                      <Badge variant="outline" className="text-xs">
                        {cacheStats.cacheSizeMB}MB
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Downloads:</span>
                      <Badge variant="outline" className="text-xs">
                        {cacheStats.downloadingLocks}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Operaciones más lentas */}
            {stats?.slowestOperations && stats.slowestOperations.length > 0 && (
              <div className="space-y-2 border-t pt-2">
                <h4 className="font-medium text-sm">Operaciones más lentas</h4>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {stats.slowestOperations.slice(0, 3).map((op: any, index: number) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="truncate">{op.operation}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${op.duration > 3000 ? 'text-red-600' : ''}`}
                      >
                        {Math.round(op.duration)}ms
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trends */}
            {stats && (
              <div className="space-y-2 border-t pt-2">
                <h4 className="font-medium text-sm">Tendencias</h4>
                <div className="flex justify-between">
                  <span>Última hora:</span>
                  <Badge variant="outline" className="text-xs">
                    {stats.recentTrends?.lastHour || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Últimos 15min:</span>
                  <Badge variant="outline" className="text-xs">
                    {stats.recentTrends?.last15Minutes || 0}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
