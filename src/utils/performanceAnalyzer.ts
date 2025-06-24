
/**
 * Analizador de performance para optimización de transacciones Clase B
 * Monitorea cuellos de botella y genera insights para mejoras
 */

interface PerformanceMetric {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  details?: Record<string, any>;
  fileSize?: number;
  cacheHit?: boolean;
}

interface PerformanceInsight {
  type: 'bottleneck' | 'optimization' | 'warning' | 'info';
  message: string;
  metric: string;
  impact: 'high' | 'medium' | 'low';
  suggestion?: string;
}

class PerformanceAnalyzer {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000;
  private readonly ANALYSIS_WINDOW = 5 * 60 * 1000; // 5 minutos

  /**
   * Registra una métrica de performance
   */
  recordMetric(
    operation: string,
    startTime: number,
    success: boolean,
    details?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      operation,
      duration: Date.now() - startTime,
      success,
      details,
      fileSize: details?.fileSize,
      cacheHit: details?.cacheHit
    };

    this.metrics.push(metric);

    // Mantener solo las métricas más recientes
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log para debugging
    console.log('📊 PerformanceAnalyzer: Métrica registrada:', {
      operation,
      duration: metric.duration + 'ms',
      success,
      cacheHit: details?.cacheHit
    });
  }

  /**
   * Wrapper para medir automáticamente el tiempo de operaciones
   */
  async measureOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    details?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    let success = false;
    let result: T;

    try {
      result = await fn();
      success = true;
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      this.recordMetric(operation, startTime, success, details);
    }
  }

  /**
   * Analiza métricas y genera insights
   */
  analyzePerformance(): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];
    const recentMetrics = this.getRecentMetrics();

    if (recentMetrics.length === 0) {
      return insights;
    }

    // Análisis de cache hit rate
    const cacheMetrics = recentMetrics.filter(m => m.cacheHit !== undefined);
    if (cacheMetrics.length > 10) {
      const hitRate = cacheMetrics.filter(m => m.cacheHit).length / cacheMetrics.length;
      
      if (hitRate < 0.6) {
        insights.push({
          type: 'bottleneck',
          message: `Cache hit rate bajo: ${Math.round(hitRate * 100)}%`,
          metric: 'cache_hit_rate',
          impact: 'high',
          suggestion: 'Revisar estrategia de cache y precarga'
        });
      } else if (hitRate > 0.8) {
        insights.push({
          type: 'optimization',
          message: `Excelente cache hit rate: ${Math.round(hitRate * 100)}%`,
          metric: 'cache_hit_rate',
          impact: 'low'
        });
      }
    }

    // Análisis de tiempos de descarga
    const downloadMetrics = recentMetrics.filter(m => 
      m.operation.includes('download') || m.operation.includes('fetch')
    );

    if (downloadMetrics.length > 5) {
      const avgDuration = downloadMetrics.reduce((sum, m) => sum + m.duration, 0) / downloadMetrics.length;
      const slowDownloads = downloadMetrics.filter(m => m.duration > 3000).length;

      if (avgDuration > 2000) {
        insights.push({
          type: 'bottleneck',
          message: `Tiempo promedio de descarga alto: ${Math.round(avgDuration)}ms`,
          metric: 'download_duration',
          impact: 'medium',
          suggestion: 'Considerar compresión o precarga más agresiva'
        });
      }

      if (slowDownloads > downloadMetrics.length * 0.2) {
        insights.push({
          type: 'warning',
          message: `${slowDownloads} descargas lentas (>3s) detectadas`,
          metric: 'slow_downloads',
          impact: 'medium',
          suggestion: 'Verificar conectividad o tamaño de archivos'
        });
      }
    }

    // Análisis de errores
    const errorRate = recentMetrics.filter(m => !m.success).length / recentMetrics.length;
    if (errorRate > 0.1) {
      insights.push({
        type: 'bottleneck',
        message: `Tasa de errores alta: ${Math.round(errorRate * 100)}%`,
        metric: 'error_rate',
        impact: 'high',
        suggestion: 'Revisar manejo de errores y fallbacks'
      });
    }

    // Análisis de patrones de operación
    const operationCounts = this.getOperationCounts(recentMetrics);
    const mostFrequent = Object.entries(operationCounts)
      .sort(([, a], [, b]) => b - a)[0];

    if (mostFrequent && mostFrequent[1] > recentMetrics.length * 0.3) {
      insights.push({
        type: 'info',
        message: `Operación más frecuente: ${mostFrequent[0]} (${mostFrequent[1]} veces)`,
        metric: 'operation_frequency',
        impact: 'low'
      });
    }

    console.log('🔍 PerformanceAnalyzer: Análisis completado:', {
      metricsAnalyzed: recentMetrics.length,
      insightsGenerated: insights.length,
      insights: insights.map(i => i.type + ': ' + i.message)
    });

    return insights;
  }

  /**
   * Obtiene estadísticas detalladas
   */
  getDetailedStats(): {
    totalOperations: number;
    averageDuration: number;
    successRate: number;
    cacheHitRate: number;
    operationBreakdown: Record<string, number>;
    slowestOperations: Array<{operation: string; duration: number}>;
    recentTrends: {
      lastHour: number;
      last15Minutes: number;
    };
  } {
    const recentMetrics = this.getRecentMetrics();
    const cacheMetrics = recentMetrics.filter(m => m.cacheHit !== undefined);
    
    const now = Date.now();
    const last15Minutes = recentMetrics.filter(m => now - m.timestamp < 15 * 60 * 1000);
    const lastHour = recentMetrics.filter(m => now - m.timestamp < 60 * 60 * 1000);

    return {
      totalOperations: recentMetrics.length,
      averageDuration: recentMetrics.length > 0 ? 
        recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length : 0,
      successRate: recentMetrics.length > 0 ? 
        recentMetrics.filter(m => m.success).length / recentMetrics.length : 0,
      cacheHitRate: cacheMetrics.length > 0 ? 
        cacheMetrics.filter(m => m.cacheHit).length / cacheMetrics.length : 0,
      operationBreakdown: this.getOperationCounts(recentMetrics),
      slowestOperations: recentMetrics
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .map(m => ({ operation: m.operation, duration: m.duration })),
      recentTrends: {
        lastHour: lastHour.length,
        last15Minutes: last15Minutes.length
      }
    };
  }

  /**
   * Obtiene métricas recientes dentro de la ventana de análisis
   */
  private getRecentMetrics(): PerformanceMetric[] {
    const cutoff = Date.now() - this.ANALYSIS_WINDOW;
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Cuenta operaciones por tipo
   */
  private getOperationCounts(metrics: PerformanceMetric[]): Record<string, number> {
    const counts: Record<string, number> = {};
    metrics.forEach(m => {
      counts[m.operation] = (counts[m.operation] || 0) + 1;
    });
    return counts;
  }

  /**
   * Exporta métricas para análisis externo
   */
  exportMetrics(): string {
    return JSON.stringify({
      exportTime: Date.now(),
      metrics: this.metrics,
      stats: this.getDetailedStats(),
      insights: this.analyzePerformance()
    }, null, 2);
  }

  /**
   * Limpia métricas antiguas
   */
  cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 horas
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    console.log('🧹 PerformanceAnalyzer: Métricas antiguas limpiadas');
  }
}

// Singleton global
export const performanceAnalyzer = new PerformanceAnalyzer();

// Auto-cleanup cada hora
setInterval(() => {
  performanceAnalyzer.cleanup();
}, 60 * 60 * 1000);
