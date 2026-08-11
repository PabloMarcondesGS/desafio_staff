/**
 * 🔒 ROTA PROTEGIDA POR TOKEN JWT: /api/inspections/[id]
 * GET: Retorna os dados completos do laudo/vistoria (respostas, blueprint, fotos, assinaturas). (Acesso: ADMIN, GESTOR, INSPETOR).
 * PUT: Atualiza status ou registra a saída/retirada com assinatura do cliente. (Acesso: ADMIN, GESTOR, INSPETOR).
 * DELETE: Exclui uma inspeção do sistema. (Acesso: ADMIN, GESTOR).
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

// 🔒 GET /api/inspections/[id]: Busca laudo completo protegido por Bearer Token
export async function GET(
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
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        client: true,
        vehicle: true,
        inspector: {
          select: { id: true, name: true, email: true },
        },
        answers: {
          orderBy: { created_at: 'asc' },
        },
        damage_markings: {
          orderBy: { created_at: 'asc' },
        },
        tire_wheel_statuses: true,
        photos: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!inspection) {
      return NextResponse.json({ error: 'Inspeção não encontrada' }, { status: 404 });
    }

    return NextResponse.json(inspection);
  } catch (error: any) {
    console.error('Erro em GET /api/inspections/[id]:', error);
    return NextResponse.json({ error: 'Erro ao buscar inspeção' }, { status: 500 });
  }
}

// 🔒 PUT /api/inspections/[id]: Atualização de vistoria ou registro de retirada do veículo (ADMIN, GESTOR, INSPETOR)
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

    const updated = await prisma.$transaction(async (tx) => {
      const inspection = await tx.inspection.update({
        where: { id },
        data: {
          ...(data.status ? { status: data.status } : {}),
          ...(data.consultant_name ? { consultant_name: data.consultant_name } : {}),
          ...(data.fuel_level !== undefined ? { fuel_level: Number(data.fuel_level) } : {}),
          ...(data.battery_lev_percent !== undefined ? { battery_lev_percent: Number(data.battery_lev_percent) } : {}),
          ...(data.bodywork_notes !== undefined ? { bodywork_notes: data.bodywork_notes } : {}),
          ...(data.tires_notes !== undefined ? { tires_notes: data.tires_notes } : {}),
          ...(data.exit_signature ? { exit_signature: data.exit_signature } : {}),
          ...(data.exit_date ? { exit_date: data.exit_date } : {}),
          ...(data.exit_time ? { exit_time: data.exit_time } : {}),
        },
      });

      return inspection;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erro em PUT /api/inspections/[id]:', error);
    return NextResponse.json({ error: 'Erro ao atualizar inspeção' }, { status: 500 });
  }
}

// 🔒 DELETE /api/inspections/[id]: Exclusão de vistoria (Acesso exclusivo: ADMIN e GESTOR)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'GESTOR')) {
      return NextResponse.json({ error: 'Apenas Administradores e Gestores podem excluir inspeções' }, { status: 403 });
    }

    const { id } = params;
    await prisma.inspection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Inspeção excluída com sucesso' });
  } catch (error: any) {
    console.error('Erro em DELETE /api/inspections/[id]:', error);
    return NextResponse.json({ error: 'Erro ao excluir inspeção' }, { status: 500 });
  }
}
