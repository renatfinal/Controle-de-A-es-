'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { formatPhone } from '@/lib/formatters';
import { X, Eye, EyeOff, UserPlus, Check } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (profile: UserProfile) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (senha !== confirmSenha) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (senha.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    onRegister({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim().toLowerCase(),
      senha: senha.trim(),
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#141A16] border border-[#243027] rounded-2xl p-5 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-[#243027] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Criar Nova Conta</h3>
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

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Carlos Silva"
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
              placeholder="(11) 98765-4321"
              maxLength={15}
              required
              className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              E-mail
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl pl-3 py-2.5 pr-8 outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-3 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Confirmar
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 transition"
              />
            </div>
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
              <span>Finalizar Cadastro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
