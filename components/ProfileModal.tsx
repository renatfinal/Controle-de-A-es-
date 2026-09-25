'use client';

import React, { useState } from 'react';
import { UserProfile, AccountMode } from '@/lib/types';
import { formatPhone } from '@/lib/formatters';
import { User } from 'firebase/auth';
import {
  X,
  Eye,
  EyeOff,
  Check,
  KeyRound,
  Sparkles,
  ShieldCheck,
  Cloud,
  CloudCheck,
  RefreshCw,
  LogOut,
  Database
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  accountMode: AccountMode;
  firebaseUser?: User | null;
  onLoginGoogle?: () => Promise<void>;
  onLogoutFirebase?: () => Promise<void>;
  onSyncCloud?: () => Promise<void>;
  onFetchCloud?: () => Promise<void>;
  isSyncingCloud?: boolean;
  onSwitchAccountMode: (mode: AccountMode) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onLogout?: () => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  accountMode,
  firebaseUser,
  onLoginGoogle,
  onLogoutFirebase,
  onSyncCloud,
  onFetchCloud,
  isSyncingCloud = false,
  onSwitchAccountMode,
  onSaveProfile,
  onLogout,
  onNotify,
}) => {
  const [nome, setNome] = useState(() => userProfile?.nome || '');
  const [telefone, setTelefone] = useState(() => userProfile?.telefone || '');
  const [email, setEmail] = useState(() => userProfile?.email || firebaseUser?.email || '');
  const [senha, setSenha] = useState(() => userProfile?.senha || '');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      onNotify('error', 'Por favor, informe seu e-mail.');
      return;
    }

    onSaveProfile({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      senha: senha.trim(),
    });

    onNotify('success', 'Perfil e configurações salvos com sucesso!');
    onClose();
  };

  const handleRecover = () => {
    if (!email.trim()) {
      onNotify('error', 'Informe um e-mail para recuperar a senha.');
      return;
    }
    onNotify('info', `Instruções de redefinição enviadas para: ${email}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#141A16] border border-[#243027] rounded-2xl p-5 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with prominent ( X ) */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#243027]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
              RF
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Perfil e Configurações</h3>
              <p className="text-xs text-zinc-400">Dados cadastrais, Nuvem e tipo de conta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#0F1411] border border-[#243027] text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-emerald-500/50 flex items-center justify-center transition shadow-sm"
            title="Fechar (X)"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Firebase Cloud Connection Card */}
        <div className="bg-[#0F1411] border border-emerald-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Banco de Dados Firebase</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              rf-investimentos-b6252
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-tight">
            Banco de dados Firestore conectado. Seus dados podem ser sincronizados na nuvem para acesso em qualquer dispositivo.
          </p>

          {firebaseUser ? (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#141A16] border border-[#243027]">
                <div className="flex items-center gap-2 overflow-hidden">
                  <CloudCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate">{firebaseUser.email}</p>
                    <p className="text-[9px] text-zinc-500 truncate">UID: {firebaseUser.uid.slice(0, 14)}...</p>
                  </div>
                </div>
                {onLogoutFirebase && (
                  <button
                    type="button"
                    onClick={onLogoutFirebase}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Desconectar Google"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {onSyncCloud && (
                  <button
                    type="button"
                    onClick={onSyncCloud}
                    disabled={isSyncingCloud}
                    className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                    <span>{isSyncingCloud ? 'Sincronizando...' : 'Enviar para Nuvem'}</span>
                  </button>
                )}
                {onFetchCloud && (
                  <button
                    type="button"
                    onClick={onFetchCloud}
                    disabled={isSyncingCloud}
                    className="py-2 px-3 rounded-xl bg-[#141A16] hover:bg-zinc-800 border border-[#243027] text-zinc-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Baixar da Nuvem</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            onLoginGoogle && (
              <button
                type="button"
                onClick={onLoginGoogle}
                className="w-full mt-1 bg-[#162019] hover:bg-[#1E2C22] border border-emerald-500/40 hover:border-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Conectar com Google / Firebase</span>
              </button>
            )
          )}
        </div>

        {/* Account Mode Switcher: Conta Demo vs Conta Real */}
        <div className="bg-[#0F1411] border border-[#243027] rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200">Tipo de Conta / Ambiente</span>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                accountMode === 'real'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}
            >
              {accountMode === 'real' ? '● Conta Real Ativa' : '● Conta Demo Ativa'}
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-tight">
            Alterne entre a sua carteira real e a conta de demonstração quando quiser. Cada ambiente mantém seus lançamentos separados.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Botão Conta Demo */}
            <button
              type="button"
              onClick={() => onSwitchAccountMode('demo')}
              className={`py-2.5 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                accountMode === 'demo'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/15 font-bold'
                  : 'bg-[#141A16] border-[#243027] text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs">Conta Demo</span>
              </div>
              <span className="text-[9px] opacity-75">Ambiente Simulação</span>
            </button>

            {/* Botão Conta Real */}
            <button
              type="button"
              onClick={() => onSwitchAccountMode('real')}
              className={`py-2.5 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                accountMode === 'real'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/15 font-bold'
                  : 'bg-[#141A16] border-[#243027] text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs">Conta Real</span>
              </div>
              <span className="text-[9px] opacity-75">Minha Carteira Oficial</span>
            </button>
          </div>
        </div>

        {/* User profile form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              required
              className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Telefone / WhatsApp
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
              className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              E-mail Principal
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              required
              className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl pl-3.5 pr-10 py-2.5 outline-none focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                title={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={handleRecover}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Recuperar Senha</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onLogout) {
                  onLogout();
                }
              }}
              className="flex-1 py-3 px-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-sm font-semibold transition flex items-center justify-center gap-2"
              title="Sair do aplicativo para efetuar um novo login"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair do App</span>
            </button>
            <button
              type="submit"
              className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Cadastro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
