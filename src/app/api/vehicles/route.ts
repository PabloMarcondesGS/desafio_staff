/**
 * 🔒 ROTA PROTEGIDA POR TOKEN JWT: /api/vehicles
 * GET: Lista veículos cadastrados com suporte a busca por placa, modelo ou marca. (Acesso: ADMIN, GESTOR, INSPETOR).
 * POST: Cadastra novo veículo vinculado ou não a um cliente. (Acesso: ADMIN, GESTOR, INSPETOR).
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

// 🔒 GET /api/vehicles: Consulta de veículos protegida por Bearer Token
export async function GET(request: Request) {
  try {
    // 1. Validação do Token JWT no Header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const plate = searchParams.get('plate');
    const search = searchParams.get('search');

    // 2. Busca direta por placa específica
    if (plate) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { plate: plate.toUpperCase() },
        include: { client: true },
      });
      return NextResponse.json(vehicle);
    }

    // 3. Listagem geral com busca
    const vehicles = await prisma.vehicle.findMany({
      where: search
        ? {
            OR: [
              { plate: { contains: search } },
              { model: { contains: search } },
              { brand: { contains: search } },
            ],
          }
        : undefined,
      include: {
        client: true,
        _count: {
          select: { inspections: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(vehicles);
  } catch (error: any) {
    console.error('Erro em GET /api/vehicles:', error);
    return NextResponse.json({ error: 'Erro ao buscar veículos' }, { status: 500 });
  }
}

// 🔒 POST /api/vehicles: Cadastro de veículo protegido por Bearer Token
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
    if (!data.plate || !data.model || !data.year_model || !data.color) {
      return NextResponse.json(
        { error: 'Placa, modelo, ano/modelo e cor são obrigatórios' },
        { status: 400 }
      );
    }

    // 2. Criação do registro de veículo
    const vehicle = await prisma.vehicle.create({
      data: {
        plate: data.plate.toUpperCase().trim(),
        model: data.model,
        brand: data.brand || null,
        year_model: data.year_model,
        color: data.color,
        km: Number(data.km) || 0,
        chassis: data.chassis || null,
        renavam: data.renavam || null,
        fuel_type: data.fuel_type || null,
        client_id: data.client_id || null,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    console.error('Erro em POST /api/vehicles:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar veículo' }, { status: 500 });
  }
}
