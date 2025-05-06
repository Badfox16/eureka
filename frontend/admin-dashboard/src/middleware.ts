import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from './lib/auth'

// Rotas que não precisam de autenticação
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

// Verificar se a rota atual é pública
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => path.startsWith(route))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Se for uma rota de API, não fazer nada
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }
  
  // Verificar se já está autenticado
  const token = request.cookies.get('token')?.value
  const isAuthenticated = !!token
  
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

// Definir em quais caminhos o middleware deve ser executado
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}