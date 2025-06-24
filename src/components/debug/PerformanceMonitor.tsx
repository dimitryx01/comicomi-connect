
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { performanceAnalyzer } from '@/utils/performanceAnalyzer';

/**
 * Monitor de performance para análisis en tiempo real
 * Solo visible en modo desarrollo
 */
export const PerformanceMonitor = () => {
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const updateData = () => {
    try {
      const performanceStats = performanceAnalyzer.getDetailedStats();
      const performanceInsights = performanceAnalyzer.analyzePerformance();
      
      setStats(performanceStats);
      setInsights(performanceInsights);
      
      console.log('📊 PerformanceMonitor: Datos actualizados:', {
        performanceStats,
        insightsCount: performanceInsights.length
      });
    } catch (error) {
      console.warn('⚠️ PerformanceMonitor: Error obteniendo datos:', error);
    }
  };

  useEffect(() => {
    // Solo mostrar en desarrollo
    const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      setIsVisible(true);
      updateData();
      
      // Actualizar cada 10 segundos
      const interval = setInterval(updateData, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  const exportData = () => {
    try {
      const data = performanceAnalyzer.exportMetrics();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-metrics-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ PerformanceMonitor: Error exportando datos:', error);
    }
  };

  if (!isVisible || !stats) {
    return null;
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'bottleneck': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'optimization': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getInsightBadgeVariant = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 w-96 max-h-[80vh] overflow-y-auto z-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance Monitor (Dev)
          </span>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={exportData}
              className="h-6 w-6 p-0"
              title="Exportar métricas"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={updateData}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Estadísticas generales */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">Operaciones totales:</span>
            <Badge variant="outline">{stats.totalOperations}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs">Tiempo promedio:</span>
            <Badge variant="outline">
              {Math.round(stats.averageDuration)}ms
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs">Tasa de éxito:</span>
              <Badge variant={stats.successRate > 0.9 ? "default" : "secondary"}>
                {Math.round(stats.successRate * 100)}%
              </Badge>
            </div>
            <Progress 
              value={stats.successRate * 100} 
              className="h-1"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs">Cache Hit Rate:</span>
              <Badge variant={stats.cacheHitRate > 0.8 ? "default" : "secondary"}>
                {Math.round(stats.cacheHitRate * 100)}%
              </Badge>
            </div>
            <Progress 
              value={stats.cacheHitRate * 100} 
              className="h-1"
            />
          </div>
        </div>

        {/* Tendencias recientes */}
        <div className="pt-2 border-t space-y-2">
          <div className="text-xs font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Actividad reciente:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Última hora:</span>
              <div className="font-mono">{stats.recentTrends.lastHour}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Últimos 15min:</span>
              <div className="font-mono">{stats.recentTrends.last15Minutes}</div>
            </div>
          </div>
        </div>

        {/* Operaciones más lentas */}
        {stats.slowestOperations && stats.slowestOperations.length > 0 && (
          <div className="pt-2 border-t space-y-2">
            <div className="text-xs font-medium">Operaciones más lentas:</div>
            <div className="space-y-1">
              {stats.slowestOperations.slice(0, 3).map((op: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1">{op.operation}</span>
                  <Badge variant="outline" className="ml-2">
                    {Math.round(op.duration)}ms
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights de performance */}
        {insights.length > 0 && (
          <div className="pt-2 border-t space-y-2">
            <div className="text-xs font-medium">Insights:</div>
            <div className="space-y-2">
              {insights.slice(0, 3).map((insight, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded-sm">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {insight.message}
                    </div>
                    {insight.suggestion && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {insight.suggestion}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={getInsightBadgeVariant(insight.impact)} 
                        className="text-xs"
                      >
                        {insight.impact}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {insight.metric}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
