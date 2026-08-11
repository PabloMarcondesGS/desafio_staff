'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Car, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('admin@fixcar.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('expired') === '1') {
      setSessionExpiredMsg(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSessionExpiredMsg(false);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Credenciais inválidas');
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand Card Top */}
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white shadow-xl shadow-sky-500/20 mb-3">
          <Car className="h-9 w-9" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          FIX<span className="text-sky-400">CAR</span>
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          Sistema de Gestão & Inspeção Veicular
        </p>
      </div>

      {/* Login Form Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-sky-400" />
          Autenticação de Usuário
        </h2>

        {sessionExpiredMsg && (
          <div className="mb-5 flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium animate-in fade-in">
            <Clock className="h-5 w-5 shrink-0" />
            <span>Sua sessão expirou (tempo limite de 2 min atingido). Faça login novamente para continuar.</span>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              E-mail de Acesso
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@fixcar.com"
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                Entrar no Sistema
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
            Perfis de Teste Pré-Configurados:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@fixcar.com', 'admin123')}
              className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold transition text-center"
            >
              ADMIN
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('gestor@fixcar.com', 'gestor123')}
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition text-center"
            >
              GESTOR
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('inspetor@fixcar.com', 'inspetor123')}
              className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[11px] font-bold transition text-center"
            >
              INSPETOR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <Suspense fallback={<div className="text-white text-xs">Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
