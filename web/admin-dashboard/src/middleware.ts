import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'
import { TokenPayload } from './lib/auth'

// Rotas que não precisam de autenticação
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

// Verificar se a rota atual é pública
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => path.startsWith(route))
}

// Verifica a validade do token
function isValidToken(token: string): boolean {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Permitir todas as chamadas de API relacionadas à autenticação
  if (pathname.startsWith('/api/v1/auth/')) {
    return NextResponse.next()
  }
  
  // Se for uma rota de API, não fazer nada
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Verificar se já está autenticado
  const token = request.cookies.get('token')?.value
  const isAuthenticated = token ? isValidToken(token) : false
  
  // Permitir acesso ao dashboard logo após login
  // Verificar se está sendo redirecionado do login
  const referer = request.headers.get('referer') || '';
  const isComingFromLogin = referer.includes('/auth/login');
  
  if (pathname === '/dashboard' && isComingFromLogin) {
    // Permitir o acesso ao dashboard se vier da tela de login,
    // mesmo que o token ainda não tenha sido validado
    return NextResponse.next();
  }
  
  // Se estiver tentando acessar uma rota protegida sem autenticação
  if (!isAuthenticated && !isPublicRoute(pathname) && pathname !== '/') {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }
  
  // Se estiver autenticado e tentando acessar login/registro, redirecionar para dashboard
  if (isAuthenticated && (isPublicRoute(pathname) || pathname === '/')) {
    const url = new URL('/dashboard', request.url)
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

// Modificar o matcher para excluir explicitamente as rotas de API de autenticação
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|api/v1/auth/.*).*)' 
  ],
}