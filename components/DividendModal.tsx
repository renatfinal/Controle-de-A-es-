'use client';

import React, { useState } from 'react';
import { maskCurrency, parseCurrencyValue } from '@/lib/formatters';
import { X, DollarSign, Check } from 'lucide-react';

interface DividendModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string | null;
  assetName: string;
  onSaveDividend: (ticker: string, date: string, value: number) => void;
}

export const DividendModal: React.FC<DividendModalProps> = ({
  isOpen,
  onClose,
  ticker,
  assetName,
  onSaveDividend,
}) => {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [value, setValue] = useState<string>('');

  if (!isOpen || !ticker) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseCurrencyValue(value);
    if (numValue <= 0) return;

    onSaveDividend(ticker, date, numValue);
    setValue('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#141A16] border border-[#243027] rounded-2xl p-5 sm:p-6 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-[#243027] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Adicionar Dividendos</h3>
              <p className="text-xs text-zinc-400">{ticker} — {assetName}</p>
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
              Data do Recebimento
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 cursor-pointer transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Valor dos Dividendos / Rendimentos (R$)
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(maskCurrency(e.target.value))}
              placeholder="0,00"
              required
              autoFocus
              className="w-full bg-[#0F1411] border border-[#243027] text-yellow-300 font-bold text-base rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 transition"
            />
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
              <span>Adicionar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
