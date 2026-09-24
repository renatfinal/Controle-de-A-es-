'use client';

import React, { useState } from 'react';
import { X, KeyRound, Mail, Check } from 'lucide-react';

interface ForgotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const ForgotModal: React.FC<ForgotModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSent(true);
    onNotify('success', `E-mail de recuperação enviado para: ${email}`);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#141A16] border border-[#243027] rounded-2xl p-5 sm:p-6 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-[#243027] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Recuperar Senha</h3>
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

        {sent ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Instruções enviadas!</h4>
            <p className="text-xs text-zinc-400">
              Verifique sua caixa de entrada no endereço <strong>{email}</strong>.
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold"
            >
              Fechar Janela (X)
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Informe o e-mail cadastrado na sua conta para enviarmos o link seguro de redefinição de senha.
            </p>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  required
                  autoFocus
                  className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl pl-3.5 pr-10 py-2.5 outline-none focus:border-emerald-500 transition"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0F1411] border border-[#243027] text-zinc-300 hover:text-white hover:bg-zinc-800 text-sm font-semibold transition"
              >
                Voltar (X)
              </button>
              <button
                type="submit"
                className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <span>Enviar E-mail</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
