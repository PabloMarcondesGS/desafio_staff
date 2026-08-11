'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedback } from '@/contexts/FeedbackContext';
import { Users, Plus, Search, Phone, Mail, FileText, Car, Pencil, Trash2, X } from 'lucide-react';

export default function ClientsPage() {
  const { token, user } = useAuth();
  const { showSuccess, showError, showAlert } = useFeedback();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchClients = () => {
    if (!token) return;
    setLoading(true);
    fetch(`/api/clients?search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setClients(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        showError(err, 'Erro ao carregar clientes');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setName('');
    setPhone('');
    setEmail('');
    setDocument('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (client: any) => {
    setEditingClient(client);
    setName(client.name || '');
    setPhone(client.phone || '');
    setEmail(client.email || '');
    setDocument(client.document || '');
    setModalOpen(true);
  };

  const handleDeleteClient = async (id: string, clientName: string) => {
    if (!confirm(`Deseja realmente remover o cliente "${clientName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess(`Cliente "${clientName}" removido com sucesso!`, 'Cliente Excluído');
        fetchClients();
      } else {
        showError(data.error || 'Erro ao excluir cliente');
      }
    } catch (e) {
      showError('Erro de conexão ao remover cliente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name.trim() || !phone.trim()) {
      showAlert('Nome e Telefone são campos obrigatórios.', 'Atenção');
      return;
    }

    setSaving(true);

    try {
      if (editingClient) {
        // Modo Edição
        const res = await fetch(`/api/clients/${editingClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, phone, email, document }),
        });

        const data = await res.json();
        if (res.ok) {
          showSuccess('Dados do cliente atualizados com sucesso!', 'Cliente Editado');
          setModalOpen(false);
          fetchClients();
        } else {
          showError(data.error || 'Erro ao atualizar dados do cliente');
        }
      } else {
        // Modo Cadastro
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, phone, email, document }),
        });

        const data = await res.json();
        if (res.ok) {
          showSuccess('Novo cliente cadastrado com sucesso!', 'Cliente Cadastrado');
          setModalOpen(false);
          fetchClients();
        } else {
          showError(data.error || 'Erro ao cadastrar cliente');
        }
      }
    } catch (e) {
      showError('Erro de conexão ao salvar cliente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Cadastro de Clientes</h1>
            <p className="text-sm text-slate-500">Gestão, histórico e edição de clientes atendidos</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700 shadow-md shadow-sky-600/20 transition"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Nome, Telefone ou CPF/CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchClients()}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Clients Grid */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-extrabold bg-sky-50 text-sky-700 px-2 py-0.5 rounded mr-1">
                        {c._count?.inspections || 0} vistorias
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(c)}
                        title="Editar Cliente"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {(user?.role === 'ADMIN' || user?.role === 'GESTOR') && (
                        <button
                          type="button"
                          onClick={() => handleDeleteClient(c.id, c.name)}
                          title="Remover Cliente"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{c.email}</span>
                      </div>
                    )}
                    {c.document && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        <span>{c.document}</span>
                      </div>
                    )}
                  </div>
                </div>

                {c.vehicles && c.vehicles.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Car className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.vehicles.map((v: any) => v.plate).join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal Novo / Editar Cliente */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-base">
                  {editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CPF ou CNPJ</label>
                  <input
                    type="text"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500"
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
                    className="rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white hover:bg-sky-700 shadow-sm transition disabled:opacity-50"
                  >
                    {saving
                      ? 'Salvando...'
                      : editingClient
                      ? 'Salvar Alterações'
                      : 'Cadastrar Cliente'}
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
