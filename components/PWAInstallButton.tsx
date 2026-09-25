'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Download, Smartphone, X, Monitor, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'sidebar' | 'header';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'sidebar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  // Automatically hide when the app is already running installed in standalone mode
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstalledNotice(true);
        setTimeout(() => setInstalledNotice(false), 3500);
      }
    } else {
      setShowDesktopGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`flex items-center gap-2 rounded-xl transition-all shadow-md group ${
          variant === 'header'
            ? 'px-3 py-1.5 text-xs bg-emerald-500 text-black font-bold hover:bg-emerald-400 active:scale-95'
            : 'w-full px-3.5 py-2.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 font-semibold'
        }`}
        title="Instalar RF Investimentos no Dispositivo"
      >
        {isIOS ? (
          <Smartphone className="w-3.5 h-3.5 flex-shrink-0" />
        ) : (
          <Download className="w-3.5 h-3.5 flex-shrink-0 group-hover:-translate-y-0.5 transition-transform" />
        )}
        <span>{installedNotice ? 'App Instalado!' : 'Instalar App'}</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#141A16] border border-[#243027] p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#243027]">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Smartphone className="w-5 h-5" />
                <span>Instalar no iPhone / iPad</span>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-zinc-300 space-y-3.5">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                  1
                </span>
                <p className="text-xs leading-relaxed">
                  Abra este site no navegador <strong>Safari</strong> do seu iPhone ou iPad.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                  2
                </span>
                <p className="text-xs leading-relaxed">
                  Toque no ícone de <strong>Compartilhar</strong> (quadrado com seta apontando para cima) na barra de ferramentas.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                  3
                </span>
                <p className="text-xs leading-relaxed">
                  Role a lista e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-emerald-500 text-black py-2.5 text-xs font-bold hover:bg-emerald-400 transition"
            >
              Entendi, obrigado!
            </button>
          </div>
        </div>
      )}

      {/* Desktop / Android Browser Guide Modal */}
      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#141A16] border border-[#243027] p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#243027]">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Monitor className="w-5 h-5" />
                <span>Instalar RF Investimentos</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDesktopGuide(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-zinc-300 space-y-3.5">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                  1
                </span>
                <p className="text-xs leading-relaxed">
                  No <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>, localize o ícone de instalação (⤓) no lado direito da barra de endereços (URL).
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                  2
                </span>
                <p className="text-xs leading-relaxed">
                  Ou acesse o Menu (⋮) &gt; <strong>Salvar e Compartilhar</strong> &gt; <strong>Instalar RF Investimentos</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                  3
                </span>
                <p className="text-xs leading-relaxed">
                  O aplicativo abrirá em uma janela nativa independente, funcionando com rapidez e suporte 100% offline.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDesktopGuide(false)}
              className="mt-6 w-full rounded-xl bg-emerald-500 text-black py-2.5 text-xs font-bold hover:bg-emerald-400 transition"
            >
              OK, entendi!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
