'use client';

import React, { useState } from 'react';
import { Transaction, TransactionType, AssetClass } from '@/lib/types';
import { maskCurrency, parseCurrencyValue, formatMoney } from '@/lib/formatters';
import { X, Check } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id'>, existingId?: number) => void;
  initialDate?: string;
  initialTicker?: string;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialTicker,
  editingTransaction,
}) => {
  const [date, setDate] = useState<string>(() => {
    if (editingTransaction) return editingTransaction.date;
    return initialDate || new Date().toISOString().slice(0, 10);
  });

  const [nome, setNome] = useState<string>(() => {
    if (editingTransaction) return editingTransaction.nome;
    return '';
  });

  const [ticker, setTicker] = useState<string>(() => {
    if (editingTransaction) return editingTransaction.ticker;
    return initialTicker || '';
  });

  const [classe, setClasse] = useState<AssetClass>(() => {
    if (editingTransaction) return editingTransaction.classe;
    return 'Ação';
  });

  const [qtd, setQtd] = useState<string>(() => {
    if (editingTransaction && editingTransaction.qtd > 0) return String(editingTransaction.qtd);
    return '';
  });

  const [valorUn, setValorUn] = useState<string>(() => {
    if (editingTransaction && editingTransaction.valorUn > 0) return formatMoney(editingTransaction.valorUn);
    return '';
  });

  const [tipo, setTipo] = useState<TransactionType>(() => {
    if (editingTransaction) return editingTransaction.tipo;
    return 'ENTRADA';
  });

  const [dividendo, setDividendo] = useState<string>(() => {
    if (editingTransaction && editingTransaction.dividendo > 0) return formatMoney(editingTransaction.dividendo);
    return '';
  });

  if (!isOpen) return null;

  const numQtd = parseInt(qtd, 10) || 0;
  const numValorUn = parseCurrencyValue(valorUn);
  const totalCalculado = numQtd * numValorUn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticker.trim()) return;

    onSave({
      date,
      nome: nome.trim() || ticker.trim().toUpperCase(),
      ticker: ticker.trim().toUpperCase(),
      classe,
      qtd: numQtd,
      valorUn: numValorUn,
      valorTotal: totalCalculado,
      tipo,
      dividendo: parseCurrencyValue(dividendo),
    }, editingTransaction ? editingTransaction.id : undefined);

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#141A16] border border-[#243027] rounded-2xl p-4 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with prominent ( X ) */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#243027] mb-4">
          <h3 className="text-base sm:text-lg font-bold text-white">
            {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h3>
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
          {/* Data */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Data da Operação
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 transition cursor-pointer"
            />
          </div>

          {/* Nome da Empresa */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Nome do Ativo / Empresa
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Petrobras, CSHG Logística, Vale..."
              required
              className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Ticker & Classe */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Ticker (Código)
              </label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Ex: PETR4, HGLG11"
                required
                className="w-full bg-[#0F1411] border border-[#243027] text-emerald-400 font-bold text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 uppercase transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Classe do Ativo
              </label>
              <select
                value={classe}
                onChange={(e) => setClasse(e.target.value as AssetClass)}
                className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Ação">Ação</option>
                <option value="FII">FII (Fundo Imobiliário)</option>
                <option value="BDR">BDR / Internacional</option>
                <option value="ETF">ETF</option>
                <option value="Renda Fixa">Renda Fixa</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          {/* Tipo de Operação */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Tipo de Operação
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipo('ENTRADA')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                  tipo === 'ENTRADA'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-[#0F1411] text-zinc-400 border border-[#243027] hover:text-white'
                }`}
              >
                Compra
              </button>
              <button
                type="button"
                onClick={() => setTipo('SAIDA')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                  tipo === 'SAIDA'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'bg-[#0F1411] text-zinc-400 border border-[#243027] hover:text-white'
                }`}
              >
                Venda
              </button>
              <button
                type="button"
                onClick={() => setTipo('DIVIDENDO')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                  tipo === 'DIVIDENDO'
                    ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
                    : 'bg-[#0F1411] text-zinc-400 border border-[#243027] hover:text-white'
                }`}
              >
                Só Provento
              </button>
            </div>
          </div>

          {/* Quantidade & Preço Unitário (se não for só dividendo) */}
          {tipo !== 'DIVIDENDO' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    value={qtd}
                    onChange={(e) => setQtd(e.target.value)}
                    placeholder="Ex: 100"
                    min="1"
                    required
                    className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Preço Unitário (R$)
                  </label>
                  <input
                    type="text"
                    value={valorUn}
                    onChange={(e) => setValorUn(maskCurrency(e.target.value))}
                    placeholder="0,00"
                    required
                    className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Valor Total Calculado */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Valor Total da Operação
                </label>
                <div className="w-full bg-[#0B0F0C] border border-[#243027] text-emerald-400 font-black text-base rounded-xl px-3.5 py-2.5">
                  R$ {formatMoney(totalCalculado)}
                </div>
              </div>
            </>
          )}

          {/* Proventos / Dividendos */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Proventos / Dividendos (R$)
            </label>
            <input
              type="text"
              value={dividendo}
              onChange={(e) => setDividendo(maskCurrency(e.target.value))}
              placeholder="0,00"
              required={tipo === 'DIVIDENDO'}
              className="w-full bg-[#0F1411] border border-[#243027] text-yellow-300 font-semibold text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 transition"
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Preencha para registrar dividendos ou JCP recebidos na data.
            </span>
          </div>

          {/* Submit & Cancel */}
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
              <span>{editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
