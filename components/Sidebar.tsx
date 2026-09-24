'use client';

import React from 'react';
import { Calendar, FolderKanban, BarChart3, User, Database, LogOut } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { UserProfile } from '@/lib/types';

interface SidebarProps {
  activeTab: 'dashboard' | 'folders' | 'balancete';
  onSelectTab: (tab: 'dashboard' | 'folders' | 'balancete') => void;
  onOpenProfile: () => void;
  onOpenBackupModal: () => void;
  onLogout: () => void;
  userProfile: UserProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenProfile,
  onOpenBackupModal,
  onLogout,
  userProfile,
}) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#141A16] border-r border-[#243027] p-6 flex-col justify-between gap-6 flex-shrink-0 min-h-screen sticky top-0 h-screen">
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenProfile}
                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-md shadow-emerald-500/20"
                title="Abrir Perfil / Cadastro"
              >
                RF
              </button>
              <div className="flex flex-col">
                <span className="font-bold text-base text-emerald-400 leading-tight">RF Investimentos</span>
                <span className="text-[11px] text-zinc-400 truncate max-w-[130px]">
                  {userProfile?.nome ? userProfile.nome.split(' ')[0] : 'Carteira Pessoal'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center justify-start gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Calendário</span>
            </button>

            <button
              onClick={() => onSelectTab('folders')}
              className={`flex items-center justify-start gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'folders'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-emerald-400" />
              <span>Ativos</span>
            </button>

            <button
              onClick={() => onSelectTab('balancete')}
              className={`flex items-center justify-start gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'balancete'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Balancete</span>
            </button>
          </nav>
        </div>

        {/* Desktop Footer Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[#243027]">
          <PWAInstallButton variant="sidebar" />

          <button
            onClick={onOpenBackupModal}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
          >
            <Database className="w-4 h-4 text-emerald-500" />
            <span>Backup & Dados</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
          >
            <User className="w-4 h-4 text-emerald-500" />
            <span>Perfil / Cadastro</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Trocar Usuário</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top App Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-[#141A16]/95 backdrop-blur-md border-b border-[#243027] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 bg-emerald-500 text-black font-black text-sm rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20"
          >
            RF
          </button>
          <div>
            <h1 className="font-bold text-sm text-white leading-tight">RF Investimentos</h1>
            <p className="text-[10px] text-zinc-400">
              {userProfile?.nome ? userProfile.nome.split(' ')[0] : 'Carteira'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <PWAInstallButton variant="header" />
          <button
            onClick={onOpenBackupModal}
            className="p-2 text-zinc-400 hover:text-white rounded-lg bg-[#0F1411] border border-[#243027]"
            title="Dados & Backup"
            aria-label="Backup"
          >
            <Database className="w-4 h-4 text-emerald-400" />
          </button>
          <button
            onClick={onOpenProfile}
            className="p-2 text-zinc-400 hover:text-white rounded-lg bg-[#0F1411] border border-[#243027]"
            title="Meu Perfil"
            aria-label="Perfil"
          >
            <User className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb friendly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141A16]/95 backdrop-blur-md border-t border-[#243027] px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex-1 py-1.5 px-2 flex flex-col items-center justify-center gap-1 rounded-xl transition ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-bold bg-emerald-500/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Calendário</span>
        </button>

        <button
          onClick={() => onSelectTab('folders')}
          className={`flex-1 py-1.5 px-2 flex flex-col items-center justify-center gap-1 rounded-xl transition ${
            activeTab === 'folders'
              ? 'text-emerald-400 font-bold bg-emerald-500/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FolderKanban className="w-5 h-5" />
          <span className="text-[10px]">Ativos</span>
        </button>

        <button
          onClick={() => onSelectTab('balancete')}
          className={`flex-1 py-1.5 px-2 flex flex-col items-center justify-center gap-1 rounded-xl transition ${
            activeTab === 'balancete'
              ? 'text-emerald-400 font-bold bg-emerald-500/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px]">Balancete</span>
        </button>
      </nav>
    </>
  );
};
