'use client';

import React from 'react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/90 backdrop-blur-md border border-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-fade-in">
      <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
      <span>Modo Offline — Todos os dados e cálculos continuam funcionando localmente.</span>
    </div>
  );
};
