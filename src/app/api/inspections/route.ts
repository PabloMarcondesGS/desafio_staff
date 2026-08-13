/**
 * 🔒 ROTA PROTEGIDA POR TOKEN JWT: /api/inspections
 * GET: Lista vistorias/inspeções com filtros por status, termo de busca e inspetor. (Acesso: ADMIN, GESTOR, INSPETOR).
 * POST: Criação completa e atômica de nova vistoria com respostas, blueprint, pertences, fotos e assinaturas. (Acesso: ADMIN, INSPETOR).
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

// 🔒 GET /api/inspections: Listagem de inspeções protegida por Bearer Token
export async function GET(request: Request) {
  try {
    // 1. Validação de autenticação via Token JWT
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Extração dos filtros da query string
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const inspectorId = searchParams.get('inspectorId');

    // 3. Consulta de inspeções com dados do cliente, veículo e contagens
    const inspections = await prisma.inspection.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(inspectorId ? { inspector_id: inspectorId } : {}),
        ...(search
          ? {
              OR: [
                { os_number: { contains: search } },
                { vehicle: { plate: { contains: search } } },
                { client: { name: { contains: search } } },
                { consultant_name: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        client: true,
        vehicle: true,
        inspector: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            damage_markings: true,
            answers: true,
            photos: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(inspections);
  } catch (error: any) {
    console.error('Erro em GET /api/inspections:', error);
    return NextResponse.json({ error: 'Erro ao listar inspeções' }, { status: 500 });
  }
}

// 🔒 POST /api/inspections: Criação de nova inspeção protegida por Bearer Token (ADMIN, INSPETOR)
export async function POST(request: Request) {
  try {
    // 1. Validação de autenticação e permissão de vistoria
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'INSPETOR') {
      return NextResponse.json({ error: 'Perfil sem permissão para executar vistorias' }, { status: 403 });
    }

    const data = await request.json();

    // 2. Validação dos campos obrigatórios da Ordem de Serviço e vínculos
    if (!data.os_number || !data.client_id || !data.vehicle_id) {
      return NextResponse.json(
        { error: 'Número da O.S., Cliente e Veículo são obrigatórios' },
        { status: 400 }
      );
    }

    // 3. Verificação de O.S. já existente
    const existing = await prisma.inspection.findUnique({
      where: { os_number: data.os_number },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma inspeção com este número de O.S.' },
        { status: 400 }
      );
    }

    // 4. Criação atômica via transação Prisma (Inspeção + Respostas + Avarias + Fotos)
    const result = await prisma.$transaction(async (tx) => {
      const newInspection = await tx.inspection.create({
        data: {
          os_number: data.os_number,
          client_id: data.client_id,
          vehicle_id: data.vehicle_id,
          inspector_id: user.id,
          consultant_name: data.consultant_name || user.name,
          is_driver_the_scheduler: data.is_driver_the_scheduler ?? true,
          status: data.status || 'FINALIZADO',
          fuel_level: data.fuel_level !== undefined ? Number(data.fuel_level) : 0.5,
          battery_lev_percent: data.battery_lev_percent !== undefined && data.battery_lev_percent !== null ? Number(data.battery_lev_percent) : null,
          test_drive_needed: Boolean(data.test_drive_needed),
          protective_covers_placed: Boolean(data.protective_covers_placed),
          warranty_manual_requested: Boolean(data.warranty_manual_requested),
          has_bed: Boolean(data.has_bed),
          has_marine_cover: Boolean(data.has_marine_cover),
          belongings: data.belongings ? JSON.stringify(data.belongings) : '[]',
          bodywork_notes: data.bodywork_notes || null,
          tires_notes: data.tires_notes || null,
          entry_signature: data.entry_signature || null,
          entry_date: data.entry_date || new Date().toLocaleDateString('pt-BR'),
          entry_time: data.entry_time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          terms_accepted: Boolean(data.terms_accepted),
        },
      });

      // Criação das respostas do checklist
      if (Array.isArray(data.answers) && data.answers.length > 0) {
        await tx.inspectionAnswer.createMany({
          data: data.answers.map((a: any) => ({
            inspection_id: newInspection.id,
            category: a.category,
            item_name: a.item_name,
            status: a.status || 'S',
            observation: a.observation || null,
          })),
        });
      }

      // Criação dos pontos de avaria marcados no Blueprint
      if (Array.isArray(data.damage_markings) && data.damage_markings.length > 0) {
        await tx.damageMarking.createMany({
          data: data.damage_markings.map((d: any) => ({
            inspection_id: newInspection.id,
            view_type: d.view_type || 'TOP',
            damage_type: d.damage_type || 'A',
            coord_x: Number(d.coord_x ?? d.x_percent ?? 0),
            coord_y: Number(d.coord_y ?? d.y_percent ?? 0),
            notes: d.notes || null,
          })),
        });
      }

      // Criação das fotos anexadas
      if (Array.isArray(data.photos) && data.photos.length > 0) {
        await tx.inspectionPhoto.createMany({
          data: data.photos.map((p: any) => ({
            inspection_id: newInspection.id,
            category: p.category || 'GERAL',
            file_url: p.file_url,
            description: p.description || null,
          })),
        });
      }

      return newInspection;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Erro em POST /api/inspections:', error);
    return NextResponse.json({ error: 'Erro ao salvar inspeção completa' }, { status: 500 });
  }
}
