/**
 * Configuración de logs para la aplicación
 * 
 * Este módulo permite habilitar o deshabilitar logs en diferentes partes de la aplicación
 * según el entorno (desarrollo o producción) y configuraciones personalizadas.
 */

// Determinar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production';

// Configuración global para habilitar/deshabilitar todos los logs
const GLOBAL_LOGS_ENABLED = true; // Habilitado para diagnóstico

// Configuración por componente/módulo
interface LogConfig {
  [key: string]: boolean;
}

const componentLogs: LogConfig = {
  // Componentes de UI
  'Navbar': true,
  'PageLayout': true,
  'AvatarWithSignedUrl': true,
  'OriginalContentImage': true,
  'FollowButton': true,
  
  // Hooks
  'useSignedUrl': true,
  'useUserProfile': true,
  'useSavedRestaurants': true,
  'useNotifications': true,
  'useFollowStats': true,
  'useRestaurant': true,
  
  // Servicios
  'mediaStorage': true,
  'OptimizedB2Cache': true,
  'B2TransactionMonitor': true,
  
  // Contextos
  'AuthContext': true,
};

/**
 * Función para determinar si los logs están habilitados para un componente específico
 * @param componentName Nombre del componente o módulo
 * @returns boolean indicando si los logs están habilitados
 */
export const isLoggingEnabled = (componentName: string): boolean => {
  // Si los logs globales están deshabilitados, no mostrar ningún log
  if (!GLOBAL_LOGS_ENABLED) return false;
  
  // Si el componente tiene una configuración específica, usarla
  if (componentName in componentLogs) {
    return componentLogs[componentName];
  }
  
  // Por defecto, permitir logs en desarrollo
  return !isProduction;
};

/**
 * Logger personalizado que respeta la configuración de logs
 * @param componentName Nombre del componente o módulo
 * @param message Mensaje a mostrar
 * @param data Datos adicionales (opcional)
 */
export const logger = {
  log: (componentName: string, message: string, data?: any) => {
    if (isLoggingEnabled(componentName)) {
      console.log(`${componentName}: ${message}`, data);
    }
  },
  
  info: (componentName: string, message: string, data?: any) => {
    if (isLoggingEnabled(componentName)) {
      console.info(`ℹ️ ${componentName}: ${message}`, data);
    }
  },
  
  warn: (componentName: string, message: string, data?: any) => {
    if (isLoggingEnabled(componentName)) {
      console.warn(`⚠️ ${componentName}: ${message}`, data);
    }
  },
  
  error: (componentName: string, message: string, data?: any) => {
    if (isLoggingEnabled(componentName)) {
      console.error(`❌ ${componentName}: ${message}`, data);
    }
  },
  
  success: (componentName: string, message: string, data?: any) => {
    if (isLoggingEnabled(componentName)) {
      console.log(`✅ ${componentName}: ${message}`, data);
    }
  }
};