
/**
 * Monitor para transacciones Backblaze B2 - Optimización de costos
 */

interface B2Transaction {
  type: 'A' | 'B' | 'C';
  operation: string;
  component: string;
  fileId?: string;
  timestamp: number;
  reason: string;
}

interface B2TransactionStats {
  totalTransactions: number;
  typeA: number; // Downloads
  typeB: number; // URL firmadas
  typeC: number; // Listados/metadatos
  byComponent: Record<string, number>;
  byOperation: Record<string, number>;
  potentialSavings: number;
}

class B2TransactionMonitor {
  private transactions: B2Transaction[] = [];
  private readonly maxTransactions = 1000; // Mantener últimas 1000

  /**
   * Registra una transacción tipo B (URL firmada)
   */
  logTransactionB(component: string, operation: string, fileId: string, reason: string = 'signed_url_request') {
    console.log('💰 B2Transaction [TYPE B]:', {
      type: 'B',
      component,
      operation,
      fileId: fileId ? fileId.substring(0, 30) + '...' : 'no fileId',
      reason,
      timestamp: Date.now()
    });

    this.addTransaction({
      type: 'B',
      operation,
      component,
      fileId,
      timestamp: Date.now(),
      reason
    });
  }

  /**
   * Registra una transacción tipo C (listado/metadatos) - CRÍTICA PARA COSTOS
   */
  logTransactionC(component: string, operation: string, reason: string, fileId?: string) {
    console.warn('🚨 B2Transaction [TYPE C - EXPENSIVE]:', {
      type: 'C',
      component,
      operation,
      fileId: fileId ? fileId.substring(0, 30) + '...' : 'bulk_operation',
      reason,
      timestamp: Date.now(),
      costImpact: 'HIGH - Revisar si es necesaria'
    });

    this.addTransaction({
      type: 'C',
      operation,
      component,
      fileId,
      timestamp: Date.now(),
      reason
    });
  }

  /**
   * Registra una transacción tipo A (descarga)
   */
  logTransactionA(component: string, operation: string, fileId: string, reason: string = 'file_download') {
    console.log('📥 B2Transaction [TYPE A]:', {
      type: 'A',
      component,
      operation,
      fileId: fileId ? fileId.substring(0, 30) + '...' : 'no fileId',
      reason,
      timestamp: Date.now()
    });

    this.addTransaction({
      type: 'A',
      operation,
      component,
      fileId,
      timestamp: Date.now(),
      reason
    });
  }

  private addTransaction(transaction: B2Transaction) {
    this.transactions.push(transaction);
    
    // Mantener solo las últimas transacciones
    if (this.transactions.length > this.maxTransactions) {
      this.transactions = this.transactions.slice(-this.maxTransactions);
    }
  }

  /**
   * Obtiene estadísticas de transacciones
   */
  getStats(timeRangeMs: number = 3600000): B2TransactionStats { // Última hora por defecto
    const cutoff = Date.now() - timeRangeMs;
    const recentTransactions = this.transactions.filter(t => t.timestamp > cutoff);

    const stats: B2TransactionStats = {
      totalTransactions: recentTransactions.length,
      typeA: 0,
      typeB: 0,
      typeC: 0,
      byComponent: {},
      byOperation: {},
      potentialSavings: 0
    };

    recentTransactions.forEach(transaction => {
      // Contar por tipo
      stats[`type${transaction.type}` as keyof B2TransactionStats]++;
      
      // Contar por componente
      stats.byComponent[transaction.component] = (stats.byComponent[transaction.component] || 0) + 1;
      
      // Contar por operación
      stats.byOperation[transaction.operation] = (stats.byOperation[transaction.operation] || 0) + 1;
    });

    // Calcular ahorros potenciales (estimado)
    stats.potentialSavings = this.calculatePotentialSavings(recentTransactions);

    return stats;
  }

  private calculatePotentialSavings(transactions: B2Transaction[]): number {
    // Detectar patrones de redundancia
    const duplicateRequests = this.findDuplicateRequests(transactions);
    const cacheMisses = this.findCacheMisses(transactions);
    
    return duplicateRequests + cacheMisses;
  }

  private findDuplicateRequests(transactions: B2Transaction[]): number {
    const seen = new Set<string>();
    let duplicates = 0;

    transactions.forEach(transaction => {
      if (transaction.fileId) {
        const key = `${transaction.component}-${transaction.fileId}`;
        if (seen.has(key)) {
          duplicates++;
        } else {
          seen.add(key);
        }
      }
    });

    return duplicates;
  }

  private findCacheMisses(transactions: B2Transaction[]): number {
    return transactions.filter(t => 
      t.reason.includes('cache_miss') || 
      t.reason.includes('redundant')
    ).length;
  }

  /**
   * Genera reporte de optimización
   */
  generateOptimizationReport(): string {
    const stats = this.getStats();
    
    return `
📊 REPORTE DE OPTIMIZACIÓN B2 (Última hora)
═══════════════════════════════════════════

💰 TRANSACCIONES POR TIPO:
- Tipo A (Downloads): ${stats.typeA}
- Tipo B (URLs firmadas): ${stats.typeB}
- Tipo C (Listados): ${stats.typeC} ⚠️
- Total: ${stats.totalTransactions}

📍 POR COMPONENTE:
${Object.entries(stats.byComponent)
  .sort(([,a], [,b]) => b - a)
  .map(([component, count]) => `- ${component}: ${count}`)
  .join('\n')}

🔄 POR OPERACIÓN:
${Object.entries(stats.byOperation)
  .sort(([,a], [,b]) => b - a)
  .map(([operation, count]) => `- ${operation}: ${count}`)
  .join('\n')}

💡 AHORROS POTENCIALES: ${stats.potentialSavings} transacciones

${stats.typeC > 0 ? '🚨 ALERTA: Transacciones tipo C detectadas - Revisar urgentemente' : '✅ Sin transacciones tipo C costosas'}
    `.trim();
  }

  /**
   * Limpia el historial
   */
  clear() {
    this.transactions = [];
    console.log('🧹 B2TransactionMonitor: Historial limpiado');
  }
}

export const b2TransactionMonitor = new B2TransactionMonitor();
