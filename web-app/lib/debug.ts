let debugMode = false;

// Check localStorage and URL params on initialization
if (typeof window !== 'undefined') {
  const fromStorage = localStorage.getItem('debug') === 'true';
  const fromUrl = new URLSearchParams(window.location.search).get('debug') === 'true';
  debugMode = fromStorage || fromUrl;
}

export const debug = {
  setEnabled: (enabled: boolean) => {
    debugMode = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug', enabled.toString());
    }
  },
  isEnabled: () => debugMode,
  log: (...args: any[]) => {
    if (debugMode) {
      console.log('[DEBUG]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (debugMode) {
      console.error('[DEBUG ERROR]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (debugMode) {
      console.warn('[DEBUG WARN]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (debugMode) {
      console.info('[DEBUG INFO]', ...args);
    }
  },
};
