'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'sidebar' | 'header' }> = ({ variant = 'sidebar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstalledNotice(true);
      setTimeout(() => setInstalledNotice(false), 3000);
    }
  };

  return (
    <>
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-2 rounded-lg font-medium transition-all shadow-sm ${
            variant === 'sidebar'
              ? 'w-full px-3 py-2 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
              : 'px-3 py-1.5 text-xs bg-emerald-600 text-black font-semibold hover:bg-emerald-500'
          }`}
          title="Instalar App no Dispositivo"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{installedNotice ? 'Instalado!' : 'Instalar App'}</span>
        </button>
      )}

      {isIOS && (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-2 rounded-lg font-medium transition-all ${
              variant === 'sidebar'
                ? 'w-full px-3 py-2 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                : 'px-3 py-1.5 text-xs bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Instalar no iOS</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-2xl bg-[#141A16] border border-[#243027] p-6 shadow-2xl text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Smartphone className="w-5 h-5" />
                    <span>Instalar no iPhone / iPad</span>
                  </div>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-zinc-300 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
                    <p>Abra este site no navegador <strong>Safari</strong> do iOS.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                    <p>Toque no ícone de <strong>Compartilhar</strong> (quadrado com seta para cima) na barra inferior.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                    <p>Role e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong>.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-5 w-full rounded-lg bg-emerald-500 text-black py-2.5 text-sm font-semibold hover:bg-emerald-400 transition"
                >
                  Entendi
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
