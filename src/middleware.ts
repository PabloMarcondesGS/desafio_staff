/**
 * 🛡️ MIDDLEWARE GLOBAL DE SEGURANÇA E PROTEÇÃO DE ROTAS POR TOKEN JWT
 * Intercepta todas as requisições da aplicação (App Router e API Routes):
 * - Rotas Públicas: /login, /api/auth/login, /uploads, /_next, /favicon.ico
 * - Rotas Privadas de API (/api/*): Bloqueia com 401 Unauthorized se não houver Token JWT.
 * - Rotas Privadas de Frontend: Redireciona usuários não autenticados imediatamente para /login.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de prefixos e caminhos públicos liberados
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Libera arquivos estáticos do Next.js e uploads de imagens
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/api/uploads') ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    // Se o usuário já estiver logado e tentar acessar /login, redireciona para a home /
    const token =
      request.cookies.get('fixcar_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  // 2. Extrai o token JWT do cabeçalho Authorization ou dos Cookies
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('fixcar_token')?.value;
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.substring(7)
    : cookieToken;

  // 3. Se não houver token e for uma rota de API privada, bloqueia com 401
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Acesso negado. Esta rota é estritamente protegida por token JWT.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 4. Se não houver token e for uma página do sistema, redireciona para /login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configuração de correspondência de rotas (Matcher do Next.js)
export const config = {
  matcher: [
    /*
     * Aplica o middleware a todas as rotas da aplicação, exceto arquivos com extensão estática
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
