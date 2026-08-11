/**
 * 🔒 ROTA PROTEGIDA POR TOKEN JWT: GET /api/auth/me
 * Valida o token JWT recebido no Header Authorization ('Bearer <token>') e retorna os dados do usuário autenticado.
 * Acesso: Usuários autenticados (ADMIN, GESTOR, INSPETOR).
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // 1. Extrai o Bearer token do header de autorização
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    // 2. Valida a assinatura e expiração do JWT
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
    }

    // 3. Consulta o usuário ativo no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        created_at: true,
      },
    });

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Usuário não encontrado ou inativo' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Erro na rota /api/auth/me:', error);
    return NextResponse.json({ error: 'Erro interno ao validar sessão' }, { status: 500 });
  }
}
