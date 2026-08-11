/**
 * 🔒 ROTA PROTEGIDA POR TOKEN JWT: /api/clients/[id]
 * GET: Retorna dados detalhados do cliente, veículos e vistorias vinculadas. (Acesso: ADMIN, GESTOR, INSPETOR).
 * PUT: Atualiza dados cadastrais do cliente (nome, telefone, e-mail, documento). (Acesso: ADMIN, GESTOR, INSPETOR).
 * DELETE: Executa Soft Delete (active: false), inativando o cliente e preservando histórico de laudos. (Acesso: ADMIN, GESTOR).
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

// 🔒 GET /api/clients/[id]: Consulta de cliente por ID protegida por Bearer Token
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        vehicles: true,
        inspections: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error: any) {
    console.error('Erro em GET /api/clients/[id]:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados do cliente' }, { status: 500 });
  }
}

// 🔒 PUT /api/clients/[id]: Atualização de dados cadastrais protegida por Bearer Token
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    if (!data.name || !data.phone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        document: data.document?.trim() || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erro em PUT /api/clients/[id]:', error);
    return NextResponse.json({ error: 'Erro ao atualizar dados do cliente' }, { status: 500 });
  }
}

// 🔒 DELETE /api/clients/[id]: Soft Delete de cliente protegida por Bearer Token (ADMIN, GESTOR)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'GESTOR')) {
      return NextResponse.json({ error: 'Apenas Administradores e Gestores podem desativar clientes' }, { status: 403 });
    }

    const { id } = params;

    // Soft Delete: Inativa o cliente no banco sem destruir dados históricos de laudos
    await prisma.client.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true, message: 'Cliente desativado com sucesso' });
  } catch (error: any) {
    console.error('Erro em DELETE /api/clients/[id]:', error);
    return NextResponse.json({ error: 'Erro ao desativar cliente' }, { status: 500 });
  }
}
