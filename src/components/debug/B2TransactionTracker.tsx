
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { b2TransactionMonitor } from '@/utils/B2TransactionMonitor';
import { optimizedB2Cache } from '@/utils/OptimizedB2Cache';

export const B2TransactionTracker = () => {
  const [stats, setStats] = useState(b2TransactionMonitor.getStats());
  const [cacheStats, setCacheStats] = useState(optimizedB2Cache.getStats());
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(b2TransactionMonitor.getStats());
      setCacheStats(optimizedB2Cache.getStats());
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const generateReport = () => {
    const transactionReport = b2TransactionMonitor.generateOptimizationReport();
    const cacheReport = optimizedB2Cache.generateEfficiencyReport();
    
    console.log('\n' + transactionReport);
    console.log('\n' + cacheReport);
    
    setShowReport(true);
  };

  const clearStats = () => {
    b2TransactionMonitor.clear();
    optimizedB2Cache.clear();
    setStats(b2TransactionMonitor.getStats());
    setCacheStats(optimizedB2Cache.getStats());
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Monitor de Transacciones B2
            <div className="flex gap-2">
              <Button onClick={generateReport} variant="outline" size="sm">
                Generar Reporte
              </Button>
              <Button onClick={clearStats} variant="destructive" size="sm">
                Limpiar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.typeA}</div>
              <div className="text-sm text-gray-600">Tipo A (Downloads)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.typeB}</div>
              <div className="text-sm text-gray-600">Tipo B (URLs)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.typeC}</div>
              <div className="text-sm text-gray-600">Tipo C (Listados)</div>
              {stats.typeC > 0 && <Badge variant="destructive" className="mt-1">¡COSTOSO!</Badge>}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.potentialSavings}</div>
              <div className="text-sm text-gray-600">Ahorros Potenciales</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Por Componente:</h4>
              <div className="space-y-1">
                {Object.entries(stats.byComponent)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([component, count]) => (
                    <div key={component} className="flex justify-between text-sm">
                      <span className="truncate">{component}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Por Operación:</h4>
              <div className="space-y-1">
                {Object.entries(stats.byOperation)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([operation, count]) => (
                    <div key={operation} className="flex justify-between text-sm">
                      <span className="truncate">{operation}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eficiencia del Cache B2</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{cacheStats.totalEntries}</div>
              <div className="text-sm text-gray-600">Entradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {Math.round(cacheStats.totalSize / 1024)}KB
              </div>
              <div className="text-sm text-gray-600">Tamaño Cache</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{cacheStats.hitRate}%</div>
              <div className="text-sm text-gray-600">Tasa Aciertos</div>
              {cacheStats.hitRate > 80 && <Badge variant="default" className="mt-1">Excelente</Badge>}
              {cacheStats.hitRate <= 60 && <Badge variant="destructive" className="mt-1">Mejorar</Badge>}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{cacheStats.transactionsSaved}</div>
              <div className="text-sm text-gray-600">Transacciones Ahorradas</div>
            </div>
          </div>
          
          {showReport && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-auto">
              <div className="text-sm font-semibold mb-2">
                📊 Reportes generados en consola - Revisa las herramientas de desarrollador
              </div>
              <div className="text-green-600">
                ✅ Reporte de optimización B2 disponible en consola
              </div>
              <div className="text-blue-600">
                ✅ Reporte de eficiencia del cache disponible en consola
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
