'use client';

import React, { useRef, useState } from 'react';
import { Transaction, UserProfile, AccountMode } from '@/lib/types';
import { exportBackupJSON, exportTransactionsCSV, INITIAL_DEMO_DATA } from '@/lib/storage';
import { X, Download, Upload, RefreshCw, Trash2, Database, ShieldCheck, AlertCircle } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  userProfile: UserProfile | null;
  accountMode?: AccountMode;
  onRestoreData: (newTransactions: Transaction[], newProfile?: UserProfile) => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  transactions,
  userProfile,
  accountMode = 'real',
  onRestoreData,
  onNotify,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDemo, setConfirmDemo] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    try {
      exportBackupJSON(transactions, userProfile, accountMode);
      onNotify('success', `Backup JSON (${accountMode === 'demo' ? 'Conta Demo' : 'Conta Real'}) baixado com sucesso!`);
    } catch {
      onNotify('error', 'Falha ao gerar arquivo de backup.');
    }
  };

  const handleExportCSV = () => {
    try {
      exportTransactionsCSV(transactions);
      onNotify('success', 'Planilha CSV exportada com sucesso!');
    } catch {
      onNotify('error', 'Falha ao exportar CSV.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let txs: Transaction[] = [];
        if (Array.isArray(parsed)) {
          txs = parsed;
        } else if (parsed && Array.isArray(parsed.transactions)) {
          txs = parsed.transactions;
        }

        if (txs.length === 0) {
          onNotify('error', 'O arquivo não contém transações válidas.');
          return;
        }

        onRestoreData(txs, parsed.profile || undefined);
        onNotify('success', `${txs.length} transações restauradas com sucesso!`);
        onClose();
      } catch (err) {
        console.error(err);
        onNotify('error', 'Erro ao ler arquivo JSON de backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleDoLoadDemo = () => {
    onRestoreData(INITIAL_DEMO_DATA);
    setConfirmDemo(false);
    onNotify('success', 'Carteira modelo carregada com sucesso!');
    onClose();
  };

  const handleDoClearAll = () => {
    onRestoreData([]);
    setConfirmClear(false);
    onNotify('info', 'Todas as operações foram apagadas.');
    onClose();
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
        <div className="flex items-center justify-between pb-3 border-b border-[#243027]">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Dados & Backup</h3>
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

        {/* Offline Badge note */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>
            Seus dados são salvos localmente e funcionam 100% offline no seu aparelho.
          </p>
        </div>

        {/* Inline confirmation for Load Demo */}
        {confirmDemo && (
          <div className="p-3.5 rounded-xl bg-yellow-950/40 border border-yellow-500/50 text-xs animate-scale-in space-y-2.5">
            <div className="flex items-center gap-2 text-yellow-300 font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Carregar carteira de demonstração?</span>
            </div>
            <p className="text-zinc-300 pl-6">
              Serão carregados 5 ativos modelo (PETR4, VALE3, HGLG11, MXRF11, ITUB4).
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setConfirmDemo(false)}
                className="px-3 py-1.5 rounded-lg bg-[#0F1411] border border-[#243027] text-zinc-300 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDoLoadDemo}
                className="px-3 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

        {/* Inline confirmation for Clear All */}
        {confirmClear && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-xs animate-scale-in space-y-2.5">
            <div className="flex items-center gap-2 text-red-300 font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Deseja apagar todas as operações?</span>
            </div>
            <p className="text-zinc-300 pl-6">
              Esta ação removerá todos os lançamentos da carteira salva neste navegador.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 rounded-lg bg-[#0F1411] border border-[#243027] text-zinc-300 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDoClearAll}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        )}

        {/* Action options */}
        <div className="space-y-2">
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0F1411] border border-[#243027] hover:border-emerald-500/50 hover:bg-[#16211a] text-xs font-semibold text-white transition"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar Backup (JSON)</span>
            </div>
            <span className="text-zinc-500">{transactions.length} registros</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0F1411] border border-[#243027] hover:border-emerald-500/50 hover:bg-[#16211a] text-xs font-semibold text-white transition"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar para Excel (CSV)</span>
            </div>
            <span className="text-zinc-500">planilha</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0F1411] border border-[#243027] hover:border-emerald-500/50 hover:bg-[#16211a] text-xs font-semibold text-white transition"
          >
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Restaurar Backup (JSON)</span>
            </div>
            <span className="text-zinc-500">arquivo</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={() => setConfirmDemo(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0F1411] border border-[#243027] hover:border-zinc-600 hover:bg-zinc-800/40 text-xs font-semibold text-zinc-300 transition"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-yellow-400" />
              <span>Carregar Carteira Modelo Demo</span>
            </div>
            <span className="text-zinc-500">5 ativos</span>
          </button>

          <button
            onClick={() => setConfirmClear(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#201314]/60 border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/20 text-xs font-semibold text-red-300 transition"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Limpar Todas as Operações</span>
            </div>
            <span className="text-red-400">apagar</span>
          </button>
        </div>

        <div className="pt-2 border-t border-[#243027]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#0F1411] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-[#243027] text-xs sm:text-sm font-semibold transition"
          >
            Fechar Janela (X)
          </button>
        </div>
      </div>
    </div>
  );
};
