'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  PlusCircle,
  Car,
  Users,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ChevronDown,
  List,
  Plus
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  requiredRoles?: ('ADMIN' | 'GESTOR' | 'INSPETOR')[];
}

export default function AppLayout({ children, requiredRoles }: AppLayoutProps) {
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Submenu de Inspeções aberto por padrão se estiver em /inspecoes/*
  const [inspectionsMenuOpen, setInspectionsMenuOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    if (pathname.startsWith('/inspecoes')) {
      setInspectionsMenuOpen(true);
    }
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-300">Carregando FixCar Inspeções...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isRoleAllowed = !requiredRoles || requiredRoles.includes(user.role);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="flex h-16 items-center justify-between px-6 bg-slate-950/40 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white shadow-lg shadow-sky-500/20">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black text-lg tracking-wider text-white">FIX<span className="text-sky-400">CAR</span></span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">Inspeção Veicular</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold text-sm border border-sky-500/30">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : user.role === 'GESTOR'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links com controle de visibilidade por Perfil de Acesso (RBAC) */}
        <nav className="flex-1 space-y-1.5 px-3 py-2 overflow-y-auto">
          {/* 📊 Item de Menu: Dashboard - Acessível por: ADMIN, GESTOR, INSPETOR */}
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
              pathname === '/'
                ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-600/30 font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className={`h-5 w-5 ${pathname === '/' ? 'text-white' : 'text-slate-400'}`} />
            Dashboard
          </Link>

          {/* 📋 Grupo de Menu: Inspeções - Acessível por: ADMIN, GESTOR, INSPETOR */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setInspectionsMenuOpen(!inspectionsMenuOpen)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                pathname.startsWith('/inspecoes')
                  ? 'text-white bg-slate-800/90 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardCheck className={`h-5 w-5 ${pathname.startsWith('/inspecoes') ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>Inspeções</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  inspectionsMenuOpen ? 'rotate-180 text-sky-400' : ''
                }`}
              />
            </button>

            {/* Submenu de Inspeções */}
            {inspectionsMenuOpen && (
              <div className="pl-6 pr-2 py-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* 📑 Subitem: Listar Inspeções - Acessível por: ADMIN, GESTOR, INSPETOR */}
                <Link
                  href="/inspecoes"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    pathname === '/inspecoes'
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Listar Inspeções
                </Link>

                {/* ➕ Subitem: Nova Inspeção - Acessível por: ADMIN e INSPETOR */}
                {(user.role === 'ADMIN' || user.role === 'INSPETOR') && (
                  <Link
                    href="/inspecoes/nova"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      pathname === '/inspecoes/nova'
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nova Inspeção
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* 👥 Item de Menu: Clientes - Acessível por: ADMIN, GESTOR, INSPETOR */}
          <Link
            href="/clientes"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
              pathname.startsWith('/clientes')
                ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-600/30 font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className={`h-5 w-5 ${pathname.startsWith('/clientes') ? 'text-white' : 'text-slate-400'}`} />
            Clientes
          </Link>

          {/* 🚗 Item de Menu: Veículos - Acessível por: ADMIN, GESTOR, INSPETOR */}
          <Link
            href="/veiculos"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
              pathname.startsWith('/veiculos')
                ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-600/30 font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Car className={`h-5 w-5 ${pathname.startsWith('/veiculos') ? 'text-white' : 'text-slate-400'}`} />
            Veículos
          </Link>

          {/* 👤 Item de Menu: Usuários (RBAC) - Acesso exclusivo: perfil ADMIN */}
          {user.role === 'ADMIN' && (
            <Link
              href="/usuarios"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                pathname.startsWith('/usuarios')
                  ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <UserCheck className={`h-5 w-5 ${pathname.startsWith('/usuarios') ? 'text-white' : 'text-slate-400'}`} />
              Usuários (RBAC)
            </Link>
          )}

          {/* ⚙️ Item de Menu: Parametrização - Acesso exclusivo: perfil ADMIN */}
          {user.role === 'ADMIN' && (
            <Link
              href="/configuracoes"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                pathname.startsWith('/configuracoes')
                  ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className={`h-5 w-5 ${pathname.startsWith('/configuracoes') ? 'text-white' : 'text-slate-400'}`} />
              Parametrização
            </Link>
          )}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm no-print">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-800 hidden sm:block">
              FixCar • Gestão Operacional de Vistorias
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Topbar actions */}
          </div>
        </header>

        {/* Dynamic Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/60">
          {!isRoleAllowed ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-red-200 shadow-sm">
              <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-slate-900">Acesso Não Autorizado</h2>
              <p className="text-slate-600 mt-2 max-w-md">
                Seu perfil de acesso ({user.role}) não possui permissão para acessar este módulo.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Voltar ao Dashboard
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
