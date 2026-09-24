'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { formatPhone } from '@/lib/formatters';
import { X, Eye, EyeOff, Check, KeyRound } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onNotify,
}) => {
  const [nome, setNome] = useState(() => userProfile?.nome || '');
  const [telefone, setTelefone] = useState(() => userProfile?.telefone || '');
  const [email, setEmail] = useState(() => userProfile?.email || '');
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
        className="relative w-full max-w-md bg-[#141A16] border border-[#243027] rounded-2xl p-5 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-[#243027] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
              RF
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Perfil e Cadastro</h3>
              <p className="text-xs text-zinc-400">Dados do titular da carteira</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex items-center justify-between pt-1">
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
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0F1411] border border-[#243027] text-zinc-300 hover:text-white hover:bg-zinc-800 text-sm font-semibold transition"
            >
              Cancelar (X)
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
