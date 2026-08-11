'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  ClipboardCheck,
  PlusCircle,
  Search,
  Filter,
  Eye,
  FileText,
  Trash2,
  Car,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function InspectionsListPage() {
  const { token, user } = useAuth();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchInspections = () => {
    if (!token) return;
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (statusFilter) query.append('status', statusFilter);

    fetch(`/api/inspections?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setInspections(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar inspeções:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInspections();
  }, [token, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInspections();
  };

  const handleDelete = async (id: string, os: string) => {
    if (!confirm(`Deseja realmente excluir a inspeção ${os}?`)) return;
    try {
      const res = await fetch(`/api/inspections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInspections((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert('Erro ao excluir inspeção.');
      }
    } catch (e) {
      alert('Erro de conexão ao excluir.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Gestão de Vistorias & Inspeções</h1>
            <p className="text-sm text-slate-500">
              Listagem, busca e acesso aos laudos técnicos preenchidos
            </p>
          </div>
          <Link
            href="/inspecoes/nova"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700 shadow-md shadow-sky-600/20"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Inspeção
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Placa, O.S., Cliente ou Modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </form>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 py-2 px-3 focus:border-sky-500 focus:outline-hidden"
            >
              <option value="">Todos os Status</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="RETIRADO">Retirado</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
          ) : inspections.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Nenhuma inspeção encontrada com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Nº O.S.</th>
                    <th className="px-6 py-3.5">Veículo / Placa</th>
                    <th className="px-6 py-3.5">Cliente</th>
                    <th className="px-6 py-3.5">Vistoriador</th>
                    <th className="px-6 py-3.5">Avarias</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspections.map((insp) => (
                    <tr key={insp.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{insp.os_number}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{insp.vehicle?.model}</div>
                        <div className="text-[11px] text-sky-700 font-bold">{insp.vehicle?.plate}</div>
                      </td>
                      <td className="px-6 py-4">{insp.client?.name}</td>
                      <td className="px-6 py-4">{insp.consultant_name || insp.inspector?.name}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-rose-600">
                          {insp._count?.damage_markings || 0} no blueprint
                        </span>
                      </td>
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
                          {(user?.role === 'ADMIN' || user?.role === 'GESTOR') && (
                            <button
                              type="button"
                              onClick={() => handleDelete(insp.id, insp.os_number)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
