export const PERSISTENCE_CONFIG = {
  MAX_IMAGE_PREVIEW_SIZE: 500 * 1024,
  STORAGE_VERSION: 1,
  SESSION_EXPIRY: 7 * 24 * 60 * 60 * 1000,
  DEBUG: import.meta.env.DEV,
};

export const STORAGE_KEYS = {
  LENSA_STORAGE: 'lensa-storage',
  UI_STORAGE: 'lensa-ui-storage',
  AUTH_STORAGE: 'lensa_auth',
  LANGUAGE_STORAGE: 'lensa_language',
};

export const shouldPersistImage = (fileSize: number): boolean => {
  return fileSize <= PERSISTENCE_CONFIG.MAX_IMAGE_PREVIEW_SIZE;
};

export const isSessionExpired = (timestamp: number): boolean => {
  return Date.now() - timestamp > PERSISTENCE_CONFIG.SESSION_EXPIRY;
};
