/**
 * Application configuration constants
 * Centralized location for app branding and naming
 */
export const APP_CONFIG = {
  name: 'comicomi',
  nameCapitalized: 'Comicomi',
  slug: 'comicomi-connect',
  storagePrefix: 'comicomi_',
  mediaBucket: 'comicomi-media',
  cacheDbName: 'comicomi-media-cache-v2',
  adminEmail: 'admin@comicomi.com',
  userEmailExample: 'juan@comicomi.com'
} as const;

export type AppConfig = typeof APP_CONFIG;