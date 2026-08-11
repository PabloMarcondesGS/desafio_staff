/**
 * 🔒 ROTA PROTEGIDA POR TOKEN JWT: /api/clients
 * GET: Retorna clientes ativos (active: true) com suporte a busca textual por nome, telefone e CPF/CNPJ. (Acesso: ADMIN, GESTOR, INSPETOR).
 * POST: Cadastra novo cliente no banco de dados. (Acesso: ADMIN, GESTOR, INSPETOR).
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

// 🔒 GET /api/clients: Listagem de clientes ativos protegida por Bearer Token
export async function GET(request: Request) {
  try {
    // 1. Validação do Token JWT no Header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // 2. Consulta de clientes ativos com contagem de vistorias e veículos
    const clients = await prisma.client.findMany({
      where: {
        active: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { document: { contains: search } },
                { phone: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        vehicles: true,
        _count: {
          select: { inspections: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(clients);
  } catch (error: any) {
    console.error('Erro em GET /api/clients:', error);
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
  }
}

// 🔒 POST /api/clients: Cadastro de cliente protegido por Bearer Token
export async function POST(request: Request) {
  try {
    // 1. Validação de autenticação
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    if (!data.name || !data.phone) {
      return NextResponse.json({ error: 'Nome e telefone são obrigatórios' }, { status: 400 });
    }

    // 2. Criação do cliente no banco
    const newClient = await prisma.client.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        document: data.document || null,
        active: true,
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error: any) {
    console.error('Erro em POST /api/clients:', error);
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}
