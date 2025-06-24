
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, Download, FileImage, Clock } from "lucide-react";
import { unifiedMediaCache } from '@/utils/unifiedMediaCache';

/**
 * Componente de desarrollo para mostrar métricas del cache unificado
 * Solo visible en modo desarrollo
 */
export const CacheMetricsDisplay = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const updateMetrics = () => {
    const currentMetrics = unifiedMediaCache.getMetrics();
    setMetrics(currentMetrics);
    console.log('📊 CacheMetricsDisplay: Métricas actualizadas:', currentMetrics);
  };

  useEffect(() => {
    // Solo mostrar en desarrollo
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
      updateMetrics();
      
      // Actualizar métricas cada 5 segundos
      const interval = setInterval(updateMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  if (!isVisible || !metrics) {
    return null;
  }

  const getHitRateColor = (hitRate: string) => {
    const rate = parseInt(hitRate);
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Cache Unificado (Dev)
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={updateMetrics}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {/* Hit Rate */}
        <div className="flex items-center justify-between">
          <span className="text-xs">Hit Rate:</span>
          <Badge className={`${getHitRateColor(metrics.cacheHitRate)} text-white`}>
            {metrics.cacheHitRate}
          </Badge>
        </div>

        {/* Requests */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Requests:</span>
            <div className="font-mono">{metrics.totalRequests}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Hits:</span>
            <div className="font-mono text-green-600">{metrics.cacheHits}</div>
          </div>
        </div>

        {/* Cache Size */}
        <div className="flex items-center justify-between">
          <span className="text-xs">Cache Size:</span>
          <Badge variant="outline">
            {metrics.cacheSizeMB} MB
          </Badge>
        </div>

        {/* Entries */}
        <div className="flex items-center justify-between">
          <span className="text-xs flex items-center gap-1">
            <FileImage className="h-3 w-3" />
            Entries:
          </span>
          <span className="text-xs font-mono">{metrics.entries}</span>
        </div>

        {/* Duplicates Prevented */}
        <div className="flex items-center justify-between">
          <span className="text-xs flex items-center gap-1">
            <Download className="h-3 w-3" />
            Duplicates Prevented:
          </span>
          <Badge variant="secondary">
            {metrics.duplicatePrevented}
          </Badge>
        </div>

        {/* Preload Queue */}
        <div className="flex items-center justify-between">
          <span className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Preload Queue:
          </span>
          <span className="text-xs font-mono">{metrics.preloadQueueSize}</span>
        </div>

        {/* Preload Hits */}
        <div className="flex items-center justify-between">
          <span className="text-xs">Preload Hits:</span>
          <Badge variant="outline" className="text-blue-600">
            {metrics.preloadHits}
          </Badge>
        </div>

        {/* Data Savings */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-1">Data Savings:</div>
          <div className="text-xs font-mono text-green-600">
            {Math.round(metrics.totalBytesSaved / 1024 / 1024 * 100) / 100} MB saved
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
