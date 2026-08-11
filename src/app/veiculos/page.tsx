'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Car, Plus, Search, User, ShieldCheck } from 'lucide-react';

export default function VehiclesPage() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Novo Veículo
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [brand, setBrand] = useState('');
  const [yearModel, setYearModel] = useState('2023/2024');
  const [color, setColor] = useState('');
  const [km, setKm] = useState(0);
  const [clientId, setClientId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchVehicles = () => {
    if (!token) return;
    setLoading(true);
    fetch(`/api/vehicles?search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setVehicles(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVehicles();
    if (token) {
      fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => setClients(Array.isArray(data) ? data : []));
    }
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          plate: plate.toUpperCase().trim(),
          model,
          brand,
          year_model: yearModel,
          color,
          km: Number(km) || 0,
          client_id: clientId || null,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setPlate('');
        setModel('');
        setBrand('');
        setColor('');
        setKm(0);
        fetchVehicles();
      } else {
        alert('Erro ao cadastrar veículo.');
      }
    } catch (e) {
      alert('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Cadastro de Veículos</h1>
            <p className="text-sm text-slate-500">Frota cadastrada e histórico de inspeções</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700 shadow-md shadow-sky-600/20"
          >
            <Plus className="h-4 w-4" />
            Novo Veículo
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Placa, Modelo ou Marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchVehicles()}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{v.model}</span>
                    <span className="text-xs font-black text-sky-800 tracking-wider bg-sky-50 px-2 py-0.5 rounded inline-block mt-0.5">
                      {v.plate}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                    {v._count?.inspections || 0} vistorias
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div><strong className="text-slate-500">Cor:</strong> {v.color}</div>
                  <div><strong className="text-slate-500">Ano:</strong> {v.year_model}</div>
                  <div><strong className="text-slate-500">KM:</strong> {v.km?.toLocaleString()} km</div>
                  <div><strong className="text-slate-500">Marca:</strong> {v.brand || 'N/A'}</div>
                </div>

                {v.client && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Proprietário: <strong className="text-slate-700">{v.client.name}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal Novo Veículo */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base mb-4">Cadastrar Novo Veículo</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Placa *</label>
                    <input
                      type="text"
                      required
                      placeholder="ABC-1D23"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                      className="w-full text-xs font-bold uppercase rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Modelo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Corolla XEi"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Marca / Montadora</label>
                    <input
                      type="text"
                      placeholder="Ex: Toyota"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cor *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Prata"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ano / Modelo *</label>
                    <input
                      type="text"
                      required
                      value={yearModel}
                      onChange={(e) => setYearModel(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">KM Atual</label>
                    <input
                      type="number"
                      value={km}
                      onChange={(e) => setKm(Number(e.target.value))}
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente Vinculado</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                  >
                    <option value="">Selecione um cliente (opcional)...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white hover:bg-sky-700 shadow-sm"
                  >
                    {saving ? 'Salvando...' : 'Salvar Veículo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
