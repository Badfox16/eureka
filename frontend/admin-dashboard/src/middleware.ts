import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/auth/login'];
const authRoutes = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('eureka_auth_token')?.value;
  
  // Verificar se é uma rota pública
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Verificar se o usuário está tentando acessar páginas protegidas sem autenticação
  if (!token && !pathname.startsWith('/auth/')) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }
  
  // Redirecionar usuários já logados para o dashboard se tentarem acessar login/registro
  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};