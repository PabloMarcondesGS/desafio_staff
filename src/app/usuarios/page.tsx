'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedback } from '@/contexts/FeedbackContext';
import { UserCheck, Plus, Shield, Mail, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function UsersPage() {
  const { token, user: currentUser } = useAuth();
  const { showSuccess, showError, showAlert } = useFeedback();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Novo Usuário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'GESTOR' | 'INSPETOR'>('INSPETOR');
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        showError(err, 'Erro ao carregar usuários');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name.trim() || !email.trim() || !password.trim()) {
      showAlert('Preencha todos os campos obrigatórios.', 'Atenção');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess(`Usuário ${data.name} criado com sucesso!`, 'Usuário Cadastrado');
        setModalOpen(false);
        setName('');
        setEmail('');
        setPassword('');
        setRole('INSPETOR');
        fetchUsers();
      } else {
        showError(data.error || 'Erro ao cadastrar usuário.');
      }
    } catch (e) {
      showError('Erro de conexão ao criar usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, userName: string) => {
    if (currentUser?.id === id) {
      showAlert('Você não pode excluir o seu próprio usuário logado.', 'Ação Bloqueada');
      return;
    }

    if (!confirm(`Deseja realmente remover o usuário "${userName}" do sistema?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess(`Usuário "${userName}" removido com sucesso!`, 'Usuário Excluído');
        fetchUsers();
      } else {
        showError(data.error || 'Erro ao excluir usuário');
      }
    } catch (e) {
      showError('Erro de conexão ao remover usuário.');
    }
  };

  return (
    <AppLayout requiredRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Gestão de Usuários & Perfis (RBAC)</h1>
            <p className="text-sm text-slate-500">Controle de acesso por perfil: Administrador, Gestor e Inspetor</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700 shadow-md shadow-sky-600/20 transition"
          >
            <Plus className="h-4 w-4" />
            Novo Usuário
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Nome</th>
                    <th className="px-6 py-3.5">E-mail</th>
                    <th className="px-6 py-3.5">Perfil de Acesso</th>
                    <th className="px-6 py-3.5">Vistorias</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                          {u.name}
                          {isSelf && (
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                              Você
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'GESTOR'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {u._count?.inspections || 0}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle className="h-3.5 w-3.5" /> Ativo
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              title="Remover Usuário"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Novo Usuário */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
              <h3 className="font-bold text-slate-900 text-base mb-4">Cadastrar Novo Usuário</h3>
              <form onSubmit={handleCreate} className="space-y-3">
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senha Inicial *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Perfil de Acesso (RBAC) *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-bold focus:border-sky-500"
                  >
                    <option value="INSPETOR">INSPETOR (Executa vistorias e laudos)</option>
                    <option value="GESTOR">GESTOR (Acompanha dashboard e laudos)</option>
                    <option value="ADMIN">ADMINISTRADOR (Acesso total)</option>
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
                    className="rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white hover:bg-sky-700 shadow-sm transition disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : 'Criar Usuário'}
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
