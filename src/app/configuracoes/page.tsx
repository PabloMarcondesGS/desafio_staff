'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Plus, CheckCircle2, ListFilter } from 'lucide-react';

export default function ChecklistSettingsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Novo Item
  const [category, setCategory] = useState('INTERNO');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/checklist-items', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    try {
      const res = await fetch('/api/checklist-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category, name, order: items.length + 1 }),
      });

      if (res.ok) {
        setModalOpen(false);
        setName('');
        fetchItems();
      } else {
        alert('Erro ao criar item.');
      }
    } catch (e) {
      alert('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  const formatCategoryName = (cat: string) => {
    switch (cat) {
      case 'INTERNO':
        return 'INTERNO';
      case 'FRENTE_LATERAIS':
        return 'FRENTE / LATERAIS';
      case 'TRASEIRA':
        return 'TRASEIRA';
      case 'TAMPAS_FLUIDOS_OUTROS':
        return 'TAMPAS FLUIDOS - OUTROS';
      case 'ESTATICO':
        return 'INSPEÇÃO ESTÁTICA';
      case 'RODAGEM':
        return 'TESTE DE RODAGEM';
      default:
        return cat.replace(/_/g, ' ');
    }
  };

  const categories = ['INTERNO', 'FRENTE_LATERAIS', 'TRASEIRA', 'TAMPAS_FLUIDOS_OUTROS', 'ESTATICO', 'RODAGEM'];

  return (
    <AppLayout requiredRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Parametrização do Checklist</h1>
            <p className="text-sm text-slate-500">Configure itens e categorias verificados na inspeção veicular</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700 shadow-md shadow-sky-600/20"
          >
            <Plus className="h-4 w-4" />
            Novo Item
          </button>
        </div>

        {/* Categorias e Itens */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => {
              const catItems = items.filter((i) => i.category === cat);
              return (
                <div key={cat} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-bold text-slate-900 text-sm">{formatCategoryName(cat)}</h3>
                    <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {catItems.length} itens
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {catItems.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                      >
                        <span className="font-medium text-slate-800">{it.name}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Novo Item */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base mb-4">Adicionar Item ao Checklist</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {formatCategoryName(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Item *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sensor de Ponto Cego"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                  />
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
                    {saving ? 'Salvando...' : 'Adicionar Item'}
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
