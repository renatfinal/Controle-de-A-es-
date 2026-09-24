'use client';

import React, { useState, useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { formatMoney } from '@/lib/formatters';
import { FolderKanban, MoreVertical, Plus, Edit3, DollarSign, ArrowUpRight, Search, TrendingUp } from 'lucide-react';

interface FoldersGridProps {
  transactions: Transaction[];
  initialSearch?: string;
  onOpenEditTicker: (ticker: string) => void;
  onOpenAddDividend: (ticker: string) => void;
  onOpenNewTransaction: (dateStr?: string, prefillTicker?: string) => void;
}

export const FoldersGrid: React.FC<FoldersGridProps> = ({
  transactions,
  initialSearch = '',
  onOpenEditTicker,
  onOpenAddDividend,
  onOpenNewTransaction,
}) => {
  const [filterText, setFilterText] = useState(initialSearch);
  const [classFilter, setClassFilter] = useState<'TODOS' | 'Ação' | 'FII' | 'Outros'>('TODOS');
  const [activeMenuTicker, setActiveMenuTicker] = useState<string | null>(null);

  // Group transactions by Ticker
  const assetSummaries = useMemo(() => {
    const grouped: Record<string, {
      ticker: string;
      nome: string;
      classe: string;
      qtd: number;
      custoTotal: number;
      totalCompras: number;
      totalVendas: number;
      dividendos: number;
      txCount: number;
    }> = {};

    transactions.forEach(t => {
      if (!grouped[t.ticker]) {
        grouped[t.ticker] = {
          ticker: t.ticker,
          nome: t.nome || t.ticker,
          classe: t.classe || 'Ação',
          qtd: 0,
          custoTotal: 0,
          totalCompras: 0,
          totalVendas: 0,
          dividendos: 0,
          txCount: 0,
        };
      }

      grouped[t.ticker].txCount++;
      if (t.tipo === 'ENTRADA') {
        grouped[t.ticker].qtd += t.qtd;
        grouped[t.ticker].custoTotal += t.valorTotal;
        grouped[t.ticker].totalCompras += t.valorTotal;
      } else if (t.tipo === 'SAIDA') {
        const currQtd = grouped[t.ticker].qtd;
        const pm = currQtd > 0 ? grouped[t.ticker].custoTotal / currQtd : 0;
        grouped[t.ticker].qtd -= t.qtd;
        grouped[t.ticker].custoTotal = Math.max(0, grouped[t.ticker].custoTotal - (t.qtd * pm));
        grouped[t.ticker].totalVendas += t.valorTotal;
      }

      grouped[t.ticker].dividendos += (t.dividendo || 0);
    });

    return Object.values(grouped).sort((a, b) => a.ticker.localeCompare(b.ticker));
  }, [transactions]);

  const filteredAssets = assetSummaries.filter(item => {
    const matchesText =
      item.ticker.toLowerCase().includes(filterText.toLowerCase()) ||
      item.nome.toLowerCase().includes(filterText.toLowerCase());

    const matchesClass =
      classFilter === 'TODOS' ? true :
      classFilter === 'Outros' ? (item.classe !== 'Ação' && item.classe !== 'FII') :
      item.classe === classFilter;

    return matchesText && matchesClass;
  });

  return (
    <section className="space-y-6 animate-fade-in" onClick={() => setActiveMenuTicker(null)}>
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-emerald-400" />
            <span>Pastas Individuais por Ativo</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400">
            Acompanhe a posição consolidada, preço médio e proventos recebidos por cada ação ou fundo.
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenNewTransaction();
          }}
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-emerald-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Ativo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['TODOS', 'Ação', 'FII', 'Outros'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setClassFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                classFilter === cat
                  ? 'bg-emerald-500 text-black'
                  : 'bg-[#0F1411] text-zinc-400 hover:text-white border border-[#243027]'
              }`}
            >
              {cat === 'TODOS' ? 'Todos os Ativos' : cat === 'FII' ? 'FIIs' : cat === 'Ação' ? 'Ações' : 'Outros / BDR'}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filtrar por Ticker ou Nome..."
            className="w-full bg-[#0F1411] border border-[#243027] text-white text-xs md:text-sm rounded-xl pl-9 pr-3 py-2 outline-none focus:border-emerald-500 transition"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-2.5 top-2.5 text-xs text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-12 text-center text-zinc-400">
          <FolderKanban className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-zinc-300">Nenhum ativo encontrado</p>
          <p className="text-xs text-zinc-500 mt-1">
            {filterText ? 'Tente buscar com outro termo ou limpe o filtro.' : 'Cadastre sua primeira operação para gerar a pasta do ativo.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map(item => {
            const precoMedio = item.qtd > 0 ? item.custoTotal / item.qtd : 0;
            const yieldOnCost = item.custoTotal > 0 ? (item.dividendos / item.custoTotal) * 100 : 0;
            const isMenuOpen = activeMenuTicker === item.ticker;

            return (
              <div
                key={item.ticker}
                onClick={() => onOpenEditTicker(item.ticker)}
                className="relative bg-[#141A16] border border-[#243027] hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 shadow-lg transition-all duration-200 group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-extrabold text-base sm:text-lg text-white tracking-wide">{item.ticker}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.classe}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate" title={item.nome}>
                        {item.nome}
                      </p>
                    </div>

                    {/* Action button & Dropdown */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuTicker(isMenuOpen ? null : item.ticker);
                        }}
                        className="w-9 h-9 rounded-xl bg-[#0F1411] border border-[#243027] text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 flex items-center justify-center transition shadow-sm"
                        title="Opções do Ativo"
                        aria-label="Opções"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-0 top-10 z-30 w-52 bg-[#1C241E] border border-[#243027] rounded-xl p-2 shadow-2xl space-y-1 animate-scale-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-zinc-400 border-b border-[#243027] mb-1">
                            <span>Ações: {item.ticker}</span>
                            <button
                              onClick={() => setActiveMenuTicker(null)}
                              className="text-zinc-400 hover:text-white p-0.5"
                              title="Fechar menu"
                            >
                              ✕
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              setActiveMenuTicker(null);
                              onOpenEditTicker(item.ticker);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-emerald-500/20 rounded-lg transition"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Ver / Excluir Lançamentos</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveMenuTicker(null);
                              onOpenAddDividend(item.ticker);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-emerald-500/20 rounded-lg transition"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
                            <span>Adicionar Proventos</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveMenuTicker(null);
                              onOpenNewTransaction(undefined, item.ticker);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-emerald-500/20 rounded-lg transition"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Nova Compra / Venda</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics Table */}
                  <div className="space-y-2 py-2 border-t border-b border-[#243027] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Qtd em Carteira:</span>
                      <span className={`font-bold ${item.qtd > 0 ? 'text-white' : 'text-zinc-500'}`}>
                        {item.qtd} cotas/ações
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Preço Médio (PM):</span>
                      <span className="font-semibold text-zinc-200">
                        R$ {formatMoney(precoMedio)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Custo Total Atual:</span>
                      <span className="font-bold text-emerald-400">
                        R$ {formatMoney(item.custoTotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Proventos Recebidos:</span>
                      <span className="font-bold text-yellow-300 flex items-center gap-1">
                        R$ {formatMoney(item.dividendos)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Badges */}
                <div className="mt-3 pt-1 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-zinc-400">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>YoC: <strong className="text-emerald-400">{yieldOnCost.toFixed(2)}%</strong></span>
                  </div>

                  <span className="text-zinc-500">
                    {item.txCount} transaç{item.txCount === 1 ? 'ão' : 'ões'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
