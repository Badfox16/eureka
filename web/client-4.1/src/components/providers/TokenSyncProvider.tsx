"use client";

import { useEffect } from 'react';

/**
 * Componente que sincroniza o token do localStorage com os cookies
 * para que o middleware possa acessá-lo.
 */
export function TokenSyncProvider() {
  useEffect(() => {
    // Sincronizar token do localStorage com cookies na inicialização
    const syncTokens = () => {
      const authToken = localStorage.getItem('auth_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (authToken) {
        document.cookie = `auth_token=${authToken}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=strict`;
        console.log('Token sincronizado do localStorage para cookies');
      }
      
      if (refreshToken) {
        document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=strict`;
      }
    };

    syncTokens();
  }, []);

  return null; // Este componente não renderiza nada
}
