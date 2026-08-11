/**
 * 🔒 ROTA PROTEGIDA POR TOKEN JWT: /api/users
 * GET: Lista usuários ativos do sistema com perfil RBAC. (Acesso: ADMIN).
 * POST: Cadastra novo usuário com senha criptografada via bcrypt. (Acesso exclusivo: ADMIN).
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { extractTokenFromHeader, verifyToken, hashPassword } from '@/lib/auth';

// 🔒 GET /api/users: Listagem de usuários protegida por Bearer Token (ADMIN)
export async function GET(request: Request) {
  try {
    // 1. Validação do Token JWT no Header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Consulta de usuários ativos no banco
    const users = await prisma.user.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        created_at: true,
        _count: {
          select: { inspections: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Erro em GET /api/users:', error);
    return NextResponse.json({ error: 'Erro ao listar usuários' }, { status: 500 });
  }
}

// 🔒 POST /api/users: Criação de usuário protegida por Bearer Token (Acesso exclusivo: ADMIN)
export async function POST(request: Request) {
  try {
    // 1. Validação de perfil ADMIN
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas Administradores podem cadastrar usuários' }, { status: 403 });
    }

    const data = await request.json();
    if (!data.name || !data.email || !data.password || !data.role) {
      return NextResponse.json(
        { error: 'Nome, e-mail, senha e perfil (ADMIN, GESTOR, INSPETOR) são obrigatórios' },
        { status: 400 }
      );
    }

    // 2. Verifica se o e-mail já está em uso
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: 'Já existe um usuário com este e-mail' }, { status: 400 });
    }

    // 3. Criptografa a senha com bcrypt (10 rounds de salt)
    const passwordHash = await hashPassword(data.password);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        role: data.role,
        active: data.active !== undefined ? data.active : true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        created_at: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('Erro em POST /api/users:', error);
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 });
  }
}
