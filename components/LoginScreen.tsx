'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { loginWithGoogle, isAuthCancellation } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, X } from 'lucide-react';

interface LoginScreenProps {
  userProfile: UserProfile | null;
  onLoginSuccess: () => void;
  onLoginGoogle?: (user: User) => void;
  onClose?: () => void;
  onOpenRegister: () => void;
  onOpenForgot: () => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  userProfile,
  onLoginSuccess,
  onLoginGoogle,
  onClose,
  onOpenRegister,
  onOpenForgot,
  onNotify,
}) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingInGoogle(true);
      setErrorMsg('');
      const user = await loginWithGoogle();
      if (user) {
        onLoginGoogle?.(user);
        onLoginSuccess();
        onNotify('success', `Conectado ao Firebase com: ${user.email}`);
      }
    } catch (err: unknown) {
      if (!isAuthCancellation(err)) {
        const error = err as { message?: string };
        const msg = error?.message || 'Erro ao autenticar com Google / Firebase. Verifique a conexão.';
        setErrorMsg(msg);
        onNotify('error', msg);
      }
    } finally {
      setIsLoggingInGoogle(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // If no user exists yet, allow registering or quick demo
    if (!userProfile || !userProfile.email) {
      setErrorMsg('Nenhum usuário cadastrado ainda. Clique em "Cadastrar-se" ou use o "Acesso Rápido".');
      return;
    }

    if (
      email.trim().toLowerCase() === userProfile.email.trim().toLowerCase() &&
      senha === userProfile.senha
    ) {
      onLoginSuccess();
      onNotify('success', `Bem-vindo de volta, ${userProfile.nome.split(' ')[0] || 'Investidor'}!`);
    } else {
      setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais.');
    }
  };

  const handleDemoLogin = () => {
    onLoginSuccess();
    onNotify('success', 'Acesso liberado à carteira!');
  };

  const handleDismiss = () => {
    if (onClose) {
      onClose();
    } else {
      handleDemoLogin();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0F0C]/90 backdrop-blur-md p-4 animate-fade-in">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm bg-[#141A16] border border-[#243027] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center">
        {/* Prominent ( X ) close button in the top right corner */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 w-9 h-9 rounded-xl bg-[#0F1411] border border-[#243027] text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition shadow-sm"
          title="Fechar tela de login (X)"
          aria-label="Fechar tela de login"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Monogram */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-black font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-3 mt-1 transform hover:scale-105 transition">
          RF
        </div>

        <h1 className="text-xl font-extrabold text-emerald-400 tracking-tight mb-1">
          RF Investimentos
        </h1>
        <p className="text-xs text-zinc-400 text-center mb-5">
          Acompanhamento de carteira, proventos e IRPF
        </p>

        {errorMsg && (
          <div className="w-full mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Google / Firebase Cloud Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoggingInGoogle}
          className="w-full bg-[#162019] hover:bg-[#1E2C22] border border-emerald-500/40 hover:border-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/10 mb-3.5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{isLoggingInGoogle ? 'Conectando ao Firebase...' : 'Entrar com Google (Firebase)'}</span>
        </button>

        <div className="w-full mb-3 flex items-center gap-2">
          <div className="flex-1 h-px bg-[#243027]" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">ou login com e-mail</span>
          <div className="flex-1 h-px bg-[#243027]" />
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-3">
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

          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={onOpenForgot}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
            >
              Esqueci minha senha
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 mt-1"
          >
            <span>Entrar no Sistema</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenRegister}
            className="w-full bg-transparent hover:bg-zinc-800/40 text-zinc-300 hover:text-white border border-[#243027] font-semibold py-2.5 px-4 rounded-xl text-xs transition"
          >
            Cadastrar Nova Conta
          </button>
        </form>

        <div className="w-full my-3.5 flex items-center gap-2">
          <div className="flex-1 h-px bg-[#243027]" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">ou</span>
          <div className="flex-1 h-px bg-[#243027]" />
        </div>

        {/* Demo Fast Access Button */}
        <button
          onClick={handleDemoLogin}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Acessar sem Login (Modo Consulta)</span>
        </button>

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>Dados offline salvos neste aparelho</span>
        </div>
      </div>
    </div>
  );
};
