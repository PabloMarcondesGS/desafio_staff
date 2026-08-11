/**
 * 🔒 ROTA PROTEGIDA POR TOKEN JWT: GET /api/dashboard/stats
 * Compila indicadores gerenciais, distribuição de avarias por tipo (A, R, X, F), métricas de produtividade dos inspetores e histórico recente.
 * Acesso: ADMIN, GESTOR, INSPETOR.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // 1. Validação de autenticação via Token JWT no Header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const user = token ? verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Consulta paralela de indicadores operacionais e gerenciais
    const [
      totalInspections,
      inProgressCount,
      completedCount,
      pickedUpCount,
      totalClients,
      totalVehicles,
      damageStats,
      checklistAvarias,
      recentInspections,
      inspectorsStats,
    ] = await Promise.all([
      prisma.inspection.count(),
      prisma.inspection.count({ where: { status: 'EM_ANDAMENTO' } }),
      prisma.inspection.count({ where: { status: 'FINALIZADO' } }),
      prisma.inspection.count({ where: { status: 'RETIRADO' } }),
      prisma.client.count({ where: { active: true } }),
      prisma.vehicle.count(),
      prisma.damageMarking.groupBy({
        by: ['damage_type'],
        _count: { damage_type: true },
      }),
      prisma.inspectionAnswer.count({
        where: {
          OR: [{ status: 'A' }, { status: 'I' }],
        },
      }),
      prisma.inspection.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          client: true,
          vehicle: true,
          inspector: { select: { name: true } },
          _count: { select: { damage_markings: true } },
        },
      }),
      prisma.user.findMany({
        where: { role: 'INSPETOR', active: true },
        select: {
          id: true,
          name: true,
          _count: { select: { inspections: true } },
        },
      }),
    ]);

    // 3. Legendas oficiais das avarias do checklist
    const damageTypeLabels: Record<string, string> = {
      A: 'Amassado (A)',
      R: 'Riscado (R)',
      X: 'Quebrado (X)',
      F: 'Faltante (F)',
    };

    const damageDistribution = damageStats.map((item) => ({
      type: item.damage_type,
      label: damageTypeLabels[item.damage_type] || item.damage_type,
      count: item._count.damage_type,
    }));

    return NextResponse.json({
      summary: {
        totalInspections,
        inProgressCount,
        completedCount,
        pickedUpCount,
        totalClients,
        totalVehicles,
        totalDamagesFound: damageStats.reduce((acc, d) => acc + d._count.damage_type, 0) + checklistAvarias,
      },
      damageDistribution,
      recentInspections,
      inspectorsStats,
    });
  } catch (error: any) {
    console.error('Erro em GET /api/dashboard/stats:', error);
    return NextResponse.json({ error: 'Erro ao compilar estatísticas gerenciais' }, { status: 500 });
  }
}
