'use client';

import React from 'react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex items-center gap-3 rounded-2xl bg-[#141A16]/95 border border-amber-500/50 backdrop-blur-xl px-4 py-3 text-xs font-semibold text-white shadow-2xl shadow-black/80 animate-fade-in max-w-sm">
      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
        <WifiOff className="w-4 h-4 animate-pulse" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5 font-bold text-amber-300">
          <span>Modo Offline Ativo</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping" />
        </div>
        <p className="text-[11px] text-zinc-300 font-normal leading-tight mt-0.5">
          Suas transações, gráficos e relatórios continuam 100% funcionais na memória do dispositivo.
        </p>
      </div>
    </div>
  );
};
