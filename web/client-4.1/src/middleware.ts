import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Nomes dos cookies
const AUTH_COOKIE_NAME = 'auth_token';

// Rotas públicas (não exigem autenticação)
const PUBLIC_ROUTES = ['/login', '/register'];

// Rota raiz do dashboard
const DASHBOARD_ROOT = '/dashboard';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Verifica se a rota atual é uma das rotas públicas
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  if (authToken) {
    // Se o usuário está autenticado e tenta acessar uma rota pública (login/register),
    // redireciona para o dashboard.
    if (isPublicRoute) {
      return NextResponse.redirect(new URL(DASHBOARD_ROOT, request.url));
    }
  } else {
    // Se o usuário não está autenticado e tenta acessar uma rota protegida,
    // redireciona para o login.
    if (!isPublicRoute && pathname.startsWith('/dashboard')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname); // Adiciona a URL original para redirecionamento pós-login
      return NextResponse.redirect(loginUrl);
    }
  }

  // Permite o acesso se nenhuma das condições acima for atendida
  return NextResponse.next();
}

// Configuração do matcher para definir quais rotas o middleware deve interceptar
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto as que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico (ícone de favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
