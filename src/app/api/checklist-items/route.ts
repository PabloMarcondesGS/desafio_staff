/**
 * 🔒 ROTA PROTEGIDA POR TOKEN JWT: /api/checklist-items
 * GET: Retorna os itens de template do checklist veicular ordenados por categoria. (Acesso: ADMIN, GESTOR, INSPETOR).
 * POST: Cadastra novo item de verificação no template oficial. (Acesso exclusivo: ADMIN).
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

// 🔒 GET /api/checklist-items: Listagem de itens do template de vistoria
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const items = await prisma.checklistItemTemplate.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Erro em GET /api/checklist-items:', error);
    return NextResponse.json({ error: 'Erro ao listar itens do checklist' }, { status: 500 });
  }
}

// 🔒 POST /api/checklist-items: Parametrização de novo item no checklist (Acesso exclusivo: ADMIN)
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas Administradores podem parametrizar itens' }, { status: 403 });
    }

    const data = await request.json();
    if (!data.category || !data.name) {
      return NextResponse.json({ error: 'Categoria e nome são obrigatórios' }, { status: 400 });
    }

    const newItem = await prisma.checklistItemTemplate.create({
      data: {
        category: data.category,
        name: data.name,
        order: Number(data.order) || 0,
        active: data.active !== undefined ? data.active : true,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error('Erro em POST /api/checklist-items:', error);
    return NextResponse.json({ error: 'Erro ao criar item do checklist' }, { status: 500 });
  }
}
