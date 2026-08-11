/**
 * 🔒 ROTA PROTEGIDA POR TOKEN JWT: /api/users/[id]
 * GET: Consulta dados de um usuário específico. (Acesso exclusivo: ADMIN).
 * PUT: Atualiza perfil, e-mail, nome, status ativo ou redefine senha. (Acesso exclusivo: ADMIN).
 * DELETE: Executa Soft Delete (active: false), inativando o usuário com proteção contra auto-exclusão. (Acesso exclusivo: ADMIN).
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { extractTokenFromHeader, verifyToken, hashPassword } from '@/lib/auth';

// 🔒 GET /api/users/[id]: Consulta usuário por ID (Acesso exclusivo: ADMIN)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        created_at: true,
        _count: { select: { inspections: true } },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(targetUser);
  } catch (error: any) {
    console.error('Erro em GET /api/users/[id]:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
  }
}

// 🔒 PUT /api/users/[id]: Edição de dados e permissões de usuário (Acesso exclusivo: ADMIN)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas Administradores podem editar usuários' }, { status: 403 });
    }

    const data = await request.json();
    const updateData: any = {
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.email ? { email: data.email.toLowerCase().trim() } : {}),
      ...(data.role ? { role: data.role } : {}),
      ...(data.active !== undefined ? { active: Boolean(data.active) } : {}),
    };

    if (data.password && data.password.trim().length >= 6) {
      updateData.password_hash = await hashPassword(data.password.trim());
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        created_at: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erro em PUT /api/users/[id]:', error);
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

// 🔒 DELETE /api/users/[id]: Soft delete de usuário com proteção de auto-exclusão (Acesso exclusivo: ADMIN)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas Administradores podem excluir usuários' }, { status: 403 });
    }

    // Bloqueia auto-exclusão da conta logada atualmente
    if (user.id === params.id) {
      return NextResponse.json(
        { error: 'Você não pode excluir o seu próprio usuário logado' },
        { status: 400 }
      );
    }

    // Soft Delete: Inativa o usuário no banco preservando integridade referencial de laudos
    await prisma.user.update({
      where: { id: params.id },
      data: { active: false },
    });

    return NextResponse.json({ success: true, message: 'Usuário desativado com sucesso' });
  } catch (error: any) {
    console.error('Erro em DELETE /api/users/[id]:', error);
    return NextResponse.json({ error: 'Erro ao desativar usuário' }, { status: 500 });
  }
}
