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
  userEmailExample: 'juan@comicomi.com',
  
  // Información de contacto y legal
  companyName: 'Comicomi SL',
  address: 'Barcelona 08016',
  phone: '+34 933 XX XX XX',
  contactEmail: 'hola@comicomi.com',
  supportEmail: 'soporte@comicomi.com',
  supportAdminEmail: 'soporte-admin@comicomi.com',
  investorEmail: 'inversores@comicomi.com',
  nif: 'B-XXXXXXXX',
  
  // URLs legales
  privacyPolicyUrl: '/politica-privacidad',
  termsUrl: '/terminos-condiciones',
  cookiesPolicyUrl: '/politica-cookies',
  legalNoticeUrl: '/aviso-legal',
  contactUrl: '/contactanos'
} as const;

export type AppConfig = typeof APP_CONFIG;