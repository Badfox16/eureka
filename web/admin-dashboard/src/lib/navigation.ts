/**
 * Realiza redirecionamento seguro que não é interceptado pelo middleware
 */
export function safeRedirect(path: string): void {
  if (typeof window === 'undefined') return;
  
  // Tenta com router.push primeiro se não estamos em uma página de autenticação
  if (!window.location.pathname.includes('/auth/')) {
    try {
      const { push } = require('next/navigation');
      push(path);
      
      // Verifica após um curto período se o redirecionamento funcionou
      setTimeout(() => {
        if (window.location.pathname !== path) {
          // Fallback para location.href
          window.location.href = path;
        }
      }, 100);
    } catch {
      window.location.href = path;
    }
  } else {
    // Para páginas de auth, usamos diretamente location.href
    window.location.href = path;
  }
}