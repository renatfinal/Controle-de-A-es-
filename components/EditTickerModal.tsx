'use client';

import React, { useState } from 'react';
import { Transaction } from '@/lib/types';
import { formatMoney, formatDateBR } from '@/lib/formatters';
import { X, Edit2, Trash2, Plus, ArrowUpRight, ArrowDownRight, DollarSign, AlertCircle } from 'lucide-react';

interface EditTickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string | null;
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: number) => void;
  onDeleteAllTickerTransactions?: (ticker: string) => void;
  onAddForTicker: (ticker: string) => void;
}

export const EditTickerModal: React.FC<EditTickerModalProps> = ({
  isOpen,
  onClose,
  ticker,
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  onDeleteAllTickerTransactions,
  onAddForTicker,
}) => {
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  if (!isOpen || !ticker) return null;

  const tickerTxs = transactions
    .filter(t => t.ticker === ticker)
    .sort((a, b) => b.date.localeCompare(a.date));

  const assetName = tickerTxs.length > 0 ? tickerTxs[0].nome : ticker;

  const handleConfirmDelete = () => {
    if (txToDelete) {
      onDeleteTransaction(txToDelete.id);
      setTxToDelete(null);
    }
  };

  const handleConfirmDeleteAll = () => {
    if (onDeleteAllTickerTransactions && ticker) {
      onDeleteAllTickerTransactions(ticker);
      setShowDeleteAllConfirm(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#141A16] border border-[#243027] rounded-2xl p-4 sm:p-6 shadow-2xl my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with prominent ( X ) */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#243027]">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-lg sm:text-xl text-emerald-400 tracking-wide">{ticker}</span>
              <span className="text-xs text-zinc-400 bg-[#0F1411] px-2 py-0.5 rounded-md border border-[#243027]">
                {tickerTxs.length} lançamento{tickerTxs.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-zinc-300 truncate mt-0.5">{assetName}</p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#0F1411] border border-[#243027] text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-emerald-500/50 flex items-center justify-center transition shadow-sm flex-shrink-0"
            title="Fechar (X)"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between py-3 gap-2 flex-wrap">
          <p className="text-xs text-zinc-400">
            Clique na lixeira para excluir ou no lápis para editar.
          </p>

          <div className="flex items-center gap-2">
            {tickerTxs.length > 0 && onDeleteAllTickerTransactions && (
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-2.5 py-1.5 rounded-lg transition"
                title="Excluir todas as operações deste ativo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Excluir Ativo</span>
              </button>
            )}

            <button
              onClick={() => onAddForTicker(ticker)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 rounded-lg transition shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Operação</span>
            </button>
          </div>
        </div>

        {/* Inline confirmation for single transaction deletion */}
        {txToDelete && (
          <div className="mb-3 p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-xs animate-scale-in flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-red-300 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Deseja realmente excluir este lançamento?</span>
            </div>
            <div className="text-zinc-300 pl-6">
              {txToDelete.tipo === 'ENTRADA' ? 'Compra' : txToDelete.tipo === 'SAIDA' ? 'Venda' : 'Dividendo'} de{' '}
              {formatDateBR(txToDelete.date)}
              {txToDelete.valorTotal > 0 && ` no valor de R$ ${formatMoney(txToDelete.valorTotal)}`}
              {txToDelete.dividendo > 0 && ` (+ R$ ${formatMoney(txToDelete.dividendo)} proventos)`}.
            </div>
            <div className="flex items-center gap-2 justify-end pt-1">
              <button
                onClick={() => setTxToDelete(null)}
                className="px-3 py-1.5 rounded-lg bg-[#0F1411] text-zinc-300 hover:text-white border border-[#243027] font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        )}

        {/* Inline confirmation for all ticker transactions deletion */}
        {showDeleteAllConfirm && (
          <div className="mb-3 p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-xs animate-scale-in flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-red-300 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Atenção: Excluir todos os lançamentos de {ticker}?</span>
            </div>
            <p className="text-zinc-300 pl-6">
              Todos os {tickerTxs.length} registros associados a este ativo serão removidos da carteira e do balancete.
            </p>
            <div className="flex items-center gap-2 justify-end pt-1">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-[#0F1411] text-zinc-300 hover:text-white border border-[#243027] font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteAll}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Tudo</span>
              </button>
            </div>
          </div>
        )}

        {/* List of transactions */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          {tickerTxs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              Nenhum lançamento encontrado para este ativo.
            </div>
          ) : (
            tickerTxs.map(tx => {
              const isCompra = tx.tipo === 'ENTRADA';
              const isVenda = tx.tipo === 'SAIDA';
              const isDiv = tx.tipo === 'DIVIDENDO';

              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-[#0F1411] border border-[#243027] hover:border-zinc-700 transition flex items-center justify-between gap-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        isCompra ? 'bg-emerald-500/20 text-emerald-400' :
                        isVenda ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {isCompra && <ArrowUpRight className="w-3 h-3" />}
                        {isVenda && <ArrowDownRight className="w-3 h-3" />}
                        {isDiv && <DollarSign className="w-3 h-3" />}
                        {isCompra ? 'Compra' : isVenda ? 'Venda' : 'Dividendo'}
                      </span>

                      <span className="text-xs text-zinc-400 font-medium">
                        {formatDateBR(tx.date)}
                      </span>
                    </div>

                    {!isDiv && tx.qtd > 0 && (
                      <div className="text-xs text-zinc-300">
                        {tx.qtd} cotas × R$ {formatMoney(tx.valorUn)} = <strong className="text-white">R$ {formatMoney(tx.valorTotal)}</strong>
                      </div>
                    )}

                    {tx.dividendo > 0 && (
                      <div className="text-xs text-yellow-300 font-semibold mt-0.5">
                        + R$ {formatMoney(tx.dividendo)} em proventos
                      </div>
                    )}
                  </div>

                  {/* Touch-friendly Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onEditTransaction(tx)}
                      className="w-10 h-10 rounded-xl bg-[#141A16] border border-[#243027] text-zinc-300 hover:text-white hover:border-emerald-500/50 flex items-center justify-center transition"
                      title="Editar este lançamento"
                      aria-label="Editar este lançamento"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setTxToDelete(tx)}
                      className="w-10 h-10 rounded-xl bg-[#141A16] border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/20 hover:border-red-500/60 flex items-center justify-center transition"
                      title="Excluir este lançamento"
                      aria-label="Excluir este lançamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Close Button */}
        <div className="pt-3 border-t border-[#243027] mt-3">
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
