'use client';
import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw-custom.js', { scope: '/' })
        .then((reg) => {
          console.log('[SW] Registered:', reg.scope);
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available - optionally notify user
                  console.log('[SW] New version available');
                }
              });
            }
          });
        })
        .catch((err) => console.error('[SW] Registration failed:', err));
    }
  }, []);

  return null;
}
