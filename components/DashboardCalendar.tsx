'use client';

import React, { useState } from 'react';
import { Transaction } from '@/lib/types';
import { MONTH_NAMES_PT, formatMoney, formatDateBR } from '@/lib/formatters';
import { ChevronLeft, ChevronRight, Search, PlusCircle, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';

interface DashboardCalendarProps {
  transactions: Transaction[];
  onOpenNewTransaction: (dateStr: string) => void;
  onSearchAndRedirect: (ticker: string) => void;
}

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({
  transactions,
  onOpenNewTransaction,
  onSearchAndRedirect,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDayDetails, setSelectedDayDetails] = useState<string | null>(null);

  // Years range
  const years: number[] = [];
  for (let y = today.getFullYear() - 20; y <= today.getFullYear() + 5; y++) {
    years.push(y);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDayDetails(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDayDetails(null);
  };

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Transactions in current month
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthTransactions = transactions.filter(t => t.date.startsWith(monthPrefix));

  const totalComprasMes = monthTransactions
    .filter(t => t.tipo === 'ENTRADA')
    .reduce((acc, t) => acc + t.valorTotal, 0);

  const totalVendasMes = monthTransactions
    .filter(t => t.tipo === 'SAIDA')
    .reduce((acc, t) => acc + t.valorTotal, 0);

  const totalDividendosMes = monthTransactions
    .reduce((acc, t) => acc + (t.dividendo || 0), 0);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    onSearchAndRedirect(searchQuery.trim().toUpperCase());
  };

  const selectedDayTxList = selectedDayDetails
    ? transactions.filter(t => t.date === selectedDayDetails)
    : [];

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-emerald-400" />
            <span>Painel Geral & Calendário</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400">
            Clique em qualquer dia para registrar compras, vendas ou dividendos.
          </p>
        </div>

        <button
          onClick={() => {
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            onOpenNewTransaction(`${yyyy}-${mm}-${dd}`);
          }}
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Operação Hoje</span>
        </button>
      </div>

      {/* Main Grid: Calendar (2fr) + Search and Monthly Stats (1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Card */}
        <div className="lg:col-span-2 bg-[#141A16] border border-[#243027] rounded-2xl p-4 md:p-6 shadow-xl">
          {/* Calendar Header with selects & controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={currentMonth}
                onChange={(e) => {
                  setCurrentMonth(parseInt(e.target.value, 10));
                  setSelectedDayDetails(null);
                }}
                className="bg-[#0F1411] border border-[#243027] text-emerald-400 font-bold text-sm md:text-base px-3 py-1.5 rounded-xl outline-none focus:border-emerald-500 cursor-pointer"
              >
                {MONTH_NAMES_PT.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => {
                  setCurrentYear(parseInt(e.target.value, 10));
                  setSelectedDayDetails(null);
                }}
                className="bg-[#0F1411] border border-[#243027] text-emerald-400 font-bold text-sm md:text-base px-3 py-1.5 rounded-xl outline-none focus:border-emerald-500 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2 bg-[#0F1411] border border-[#243027] text-zinc-300 hover:text-white hover:border-emerald-500/50 rounded-lg transition"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentYear(today.getFullYear());
                  setCurrentMonth(today.getMonth());
                  setSelectedDayDetails(null);
                }}
                className="px-2.5 py-1.5 bg-[#0F1411] border border-[#243027] text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
              >
                Hoje
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 bg-[#0F1411] border border-[#243027] text-zinc-300 hover:text-white hover:border-emerald-500/50 rounded-lg transition"
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
            {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((d, i) => (
              <div key={d} className={`text-[10px] md:text-xs font-bold py-1 ${i === 0 || i === 6 ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square rounded-xl bg-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();

              const dayTxs = transactions.filter(t => t.date === dateStr);
              const hasTx = dayTxs.length > 0;
              const hasEntrada = dayTxs.some(t => t.tipo === 'ENTRADA');
              const hasSaida = dayTxs.some(t => t.tipo === 'SAIDA');
              const hasDividendo = dayTxs.some(t => (t.dividendo && t.dividendo > 0) || t.tipo === 'DIVIDENDO');
              const isSelected = selectedDayDetails === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    if (hasTx) {
                      setSelectedDayDetails(selectedDayDetails === dateStr ? null : dateStr);
                    } else {
                      onOpenNewTransaction(dateStr);
                    }
                  }}
                  onDoubleClick={() => onOpenNewTransaction(dateStr)}
                  className={`aspect-square relative p-1.5 md:p-2 rounded-xl flex flex-col justify-between items-start text-left transition-all border group ${
                    isToday
                      ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                      : isSelected
                      ? 'bg-zinc-800 border-emerald-500 ring-2 ring-emerald-500/40'
                      : hasTx
                      ? 'bg-[#101713] border-[#243027] hover:border-emerald-500/60 hover:bg-[#16211a]'
                      : 'bg-[#0F1411] border-[#1d2720] hover:border-zinc-600 hover:bg-zinc-900/60'
                  }`}
                  title={
                    hasTx
                      ? `${dayTxs.length} operação(ões) em ${formatDateBR(dateStr)}. Clique para ver ou duplo-clique para adicionar.`
                      : `Clique para adicionar lançamento em ${formatDateBR(dateStr)}`
                  }
                >
                  <span
                    className={`text-xs md:text-sm font-bold leading-none ${
                      isToday
                        ? 'text-emerald-300 font-extrabold'
                        : hasTx
                        ? 'text-white'
                        : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    {day}
                  </span>

                  {/* Multi-dot event indicators */}
                  {hasTx && (
                    <div className="flex items-center gap-1 self-end mt-auto">
                      {hasEntrada && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#22C55E]" title="Compra" />
                      )}
                      {hasSaida && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_4px_#EF4444]" title="Venda" />
                      )}
                      {hasDividendo && (
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_4px_#FBBF24]" title="Dividendo" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="mt-4 pt-3 border-t border-[#243027] flex items-center justify-between flex-wrap gap-2 text-[11px] text-zinc-400">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Compra
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Venda
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Dividendo
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border border-emerald-400" />
                Dia Atual
              </span>
            </div>
            <span className="text-zinc-500 italic">Dica: duplo-clique no dia para novo lançamento</span>
          </div>

          {/* Selected day transactions drawer/accordion */}
          {selectedDayDetails && (
            <div className="mt-4 p-4 rounded-xl bg-[#0F1411] border border-emerald-500/40 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h4 className="text-xs md:text-sm font-bold text-white">
                    Lançamentos de {formatDateBR(selectedDayDetails)}
                  </h4>
                  <span className="text-xs text-zinc-400">({selectedDayTxList.length})</span>
                </div>
                <button
                  onClick={() => onOpenNewTransaction(selectedDayDetails)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Adicionar Neste Dia</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedDayTxList.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg bg-[#141A16] border border-[#243027] text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        tx.tipo === 'ENTRADA' ? 'bg-emerald-500/20 text-emerald-400' :
                        tx.tipo === 'SAIDA' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {tx.tipo === 'ENTRADA' ? 'Compra' : tx.tipo === 'SAIDA' ? 'Venda' : 'Dividendo'}
                      </span>
                      <strong className="text-white truncate">{tx.ticker}</strong>
                      <span className="text-zinc-400 truncate hidden sm:inline">{tx.nome}</span>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {tx.tipo !== 'DIVIDENDO' && tx.valorTotal > 0 && (
                        <div className="font-semibold text-white">R$ {formatMoney(tx.valorTotal)}</div>
                      )}
                      {tx.dividendo > 0 && (
                        <div className="text-emerald-400 font-semibold">+ R$ {formatMoney(tx.dividendo)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Search + Month Summary KPI */}
        <div className="space-y-6">
          {/* Direcionar para Pasta / Quick Search */}
          <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Direcionar para Pasta</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Digite o Ticker ou Nome do ativo para abrir a pasta correspondente e gerenciar lançamentos.
            </p>

            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Ticker ou Nome do Ativo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ex: PETR4, HGLG11, VALE3..."
                    className="w-full bg-[#0F1411] border border-[#243027] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 uppercase placeholder:normal-case transition"
                  />
                  <Search className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 px-4 rounded-xl text-xs md:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <span>Ir para Pasta do Ativo</span>
              </button>
            </form>
          </div>

          {/* Monthly Performance Briefing */}
          <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Resumo de {MONTH_NAMES_PT[currentMonth]}/{currentYear}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
                {monthTransactions.length} operações
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1411] border border-[#243027]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase">Compras</div>
                    <div className="text-xs font-bold text-emerald-400">R$ {formatMoney(totalComprasMes)}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1411] border border-[#243027]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase">Vendas</div>
                    <div className="text-xs font-bold text-red-400">R$ {formatMoney(totalVendasMes)}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1411] border border-[#243027]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase">Dividendos</div>
                    <div className="text-xs font-bold text-yellow-300">R$ {formatMoney(totalDividendosMes)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
