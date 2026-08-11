'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Car,
  AlertTriangle,
  Users,
  PlusCircle,
  Eye,
  FileText,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar estatísticas:', err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const summary = stats?.summary || {
    totalInspections: 0,
    inProgressCount: 0,
    completedCount: 0,
    totalVehicles: 0,
    totalDamagesFound: 0,
  };

  const damageDistribution = stats?.damageDistribution || [];
  const recentInspections = stats?.recentInspections || [];
  const inspectorsStats = stats?.inspectorsStats || [];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-400 border border-sky-500/30">
                  Painel de Controle • Perfil {user?.role}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Olá, {user?.name}! 👋
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Acompanhe o volume de vistorias, laudos emitidos e indicadores de não conformidades em tempo real.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/inspecoes/nova"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition transform hover:-translate-y-0.5"
              >
                <PlusCircle className="h-5 w-5" />
                Nova Inspeção
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 opacity-10">
            <Car className="h-96 w-96 text-white" />
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Vistorias</span>
              <h3 className="text-2xl font-black text-slate-900">{summary.totalInspections}</h3>
            </div>
          </div>

          {/* Em Andamento */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Em Andamento</span>
              <h3 className="text-2xl font-black text-amber-600">{summary.inProgressCount}</h3>
            </div>
          </div>

          {/* Finalizadas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Concluídas</span>
              <h3 className="text-2xl font-black text-emerald-600">{summary.completedCount}</h3>
            </div>
          </div>

          {/* Avarias Totais */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Não Conformidades</span>
              <h3 className="text-2xl font-black text-rose-600">{summary.totalDamagesFound}</h3>
            </div>
          </div>
        </div>

        {/* Middle Section: Damage Breakdown & Inspectors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Damage Type Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Distribuição de Avarias por Tipo</h3>
                <p className="text-xs text-slate-500">Mapeadas no blueprint da carroceria</p>
              </div>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md">
                Blueprint Analytics
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {damageDistribution.length > 0 ? (
                damageDistribution.map((item: any) => (
                  <div
                    key={item.type}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col items-center text-center"
                  >
                    <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    <span className="text-2xl font-black text-slate-900 my-1">{item.count}</span>
                    <span className="text-[10px] font-semibold text-slate-400">ocorrências</span>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-6 text-xs text-slate-400">
                  Nenhuma avaria registrada até o momento.
                </div>
              )}
            </div>
          </div>

          {/* Inspectors Ranking */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-1">Inspetores Responsáveis</h3>
            <p className="text-xs text-slate-500 mb-4">Volume de vistorias executadas</p>

            <div className="space-y-3">
              {inspectorsStats.map((insp: any) => (
                <div
                  key={insp.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-600 font-bold text-xs flex items-center justify-center">
                      {insp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{insp.name}</span>
                  </div>
                  <span className="text-xs font-extrabold bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
                    {insp._count.inspections} vistorias
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Inspections Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Últimas Vistorias Registradas</h3>
              <p className="text-xs text-slate-500">Histórico recente de entradas e laudos</p>
            </div>
            <Link
              href="/inspecoes"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Ver todas as vistorias →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Nº O.S.</th>
                  <th className="px-6 py-3.5">Veículo</th>
                  <th className="px-6 py-3.5">Cliente</th>
                  <th className="px-6 py-3.5">Inspetor</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInspections.map((insp: any) => (
                  <tr key={insp.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{insp.os_number}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {insp.vehicle?.model} ({insp.vehicle?.plate})
                    </td>
                    <td className="px-6 py-4">{insp.client?.name}</td>
                    <td className="px-6 py-4">{insp.inspector?.name || insp.consultant_name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          insp.status === 'FINALIZADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : insp.status === 'EM_ANDAMENTO'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {insp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/inspecoes/${insp.id}/laudo`}
                          className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 font-bold text-[11px] flex items-center gap-1"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Laudo
                        </Link>
                        <Link
                          href={`/inspecoes/${insp.id}`}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
