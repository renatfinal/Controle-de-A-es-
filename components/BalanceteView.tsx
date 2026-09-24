'use client';

import React, { useState, useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { formatMoney } from '@/lib/formatters';
import { downloadIrpfPDF, shareIrpfPDF } from '@/lib/irpf-pdf';
import { exportTransactionsCSV } from '@/lib/storage';
import { BarChart3, FileDown, Share2, FileSpreadsheet, ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Calendar } from 'lucide-react';

interface BalanceteViewProps {
  transactions: Transaction[];
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const BalanceteView: React.FC<BalanceteViewProps> = ({ transactions, onNotify }) => {
  const currentYear = new Date().getFullYear();
  const [monthFilter, setMonthFilter] = useState<string>(''); // YYYY-MM or empty for all
  const [reportYear, setReportYear] = useState<number>(currentYear);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  // Years for IRPF dropdown (e.g. 2026, 2025, 2024...)
  const irpfYears: number[] = [];
  for (let y = currentYear + 1; y >= currentYear - 10; y--) {
    irpfYears.push(y);
  }

  // Filtered transactions for monthly/general balance
  const filteredTransactions = useMemo(() => {
    if (!monthFilter) return transactions;
    return transactions.filter(t => t.date.startsWith(monthFilter));
  }, [transactions, monthFilter]);

  // Consolidate metrics
  const { totalCompras, totalVendas, totalDividendos, totalInvestimento, groupedByTicker } = useMemo(() => {
    let compras = 0;
    let vendas = 0;
    let dividendos = 0;

    const grouped: Record<string, {
      ticker: string;
      nome: string;
      classe: string;
      qtd: number;
      compras: number;
      vendas: number;
      dividendos: number;
      custoTotal: number;
    }> = {};

    filteredTransactions.forEach(t => {
      if (t.tipo === 'ENTRADA') compras += t.valorTotal;
      if (t.tipo === 'SAIDA') vendas += t.valorTotal;
      dividendos += (t.dividendo || 0);

      if (!grouped[t.ticker]) {
        grouped[t.ticker] = {
          ticker: t.ticker,
          nome: t.nome,
          classe: t.classe || 'Ação',
          qtd: 0,
          compras: 0,
          vendas: 0,
          dividendos: 0,
          custoTotal: 0,
        };
      }

      if (t.tipo === 'ENTRADA') {
        grouped[t.ticker].qtd += t.qtd;
        grouped[t.ticker].compras += t.valorTotal;
        grouped[t.ticker].custoTotal += t.valorTotal;
      } else if (t.tipo === 'SAIDA') {
        const currQtd = grouped[t.ticker].qtd;
        const pm = currQtd > 0 ? grouped[t.ticker].custoTotal / currQtd : 0;
        grouped[t.ticker].qtd -= t.qtd;
        grouped[t.ticker].vendas += t.valorTotal;
        grouped[t.ticker].custoTotal = Math.max(0, grouped[t.ticker].custoTotal - (t.qtd * pm));
      }

      grouped[t.ticker].dividendos += (t.dividendo || 0);
    });

    const saldoPatrimonial = compras - vendas + dividendos;

    return {
      totalCompras: compras,
      totalVendas: vendas,
      totalDividendos: dividendos,
      totalInvestimento: saldoPatrimonial,
      groupedByTicker: Object.values(grouped).sort((a, b) => a.ticker.localeCompare(b.ticker)),
    };
  }, [filteredTransactions]);

  // Handle PDF Download
  const handleExportPDF = () => {
    try {
      setIsGeneratingPdf(true);
      downloadIrpfPDF(transactions, reportYear);
      onNotify('success', `Relatório IRPF Exercício ${reportYear} gerado com sucesso!`);
    } catch (err) {
      console.error(err);
      onNotify('error', 'Erro ao gerar PDF do relatório IRPF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle Share
  const handleShareReport = async () => {
    try {
      setIsSharing(true);
      const res = await shareIrpfPDF(transactions, reportYear);
      if (res.method === 'share-api') {
        onNotify('success', 'Relatório compartilhado com sucesso!');
      } else if (res.method === 'download-fallback') {
        onNotify('info', 'PDF baixado para o seu dispositivo para envio.');
      }
    } catch (err) {
      console.error(err);
      onNotify('error', 'Falha ao compartilhar relatório.');
    } finally {
      setIsSharing(false);
    }
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    try {
      exportTransactionsCSV(filteredTransactions);
      onNotify('success', 'Planilha CSV exportada com sucesso!');
    } catch {
      onNotify('error', 'Erro ao exportar CSV.');
    }
  };

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <span>Balancete Mensal e Geral</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400">
            Visão consolidada de aportes, desinvestimentos, proventos apurados e relatório formal para IRPF.
          </p>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Compras */}
        <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold mb-2">
            <span>COMPRAS</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg md:text-2xl font-black text-emerald-400 truncate" title={`R$ ${formatMoney(totalCompras)}`}>
            R$ {formatMoney(totalCompras)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Aportes no período</div>
        </div>

        {/* Vendas */}
        <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold mb-2">
            <span>VENDAS</span>
            <ArrowDownRight className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-lg md:text-2xl font-black text-red-400 truncate" title={`R$ ${formatMoney(totalVendas)}`}>
            R$ {formatMoney(totalVendas)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Desinvestimentos</div>
        </div>

        {/* Dividendos */}
        <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold mb-2">
            <span>DIVIDENDOS RECEBIDOS</span>
            <DollarSign className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-lg md:text-2xl font-black text-yellow-300 truncate" title={`R$ ${formatMoney(totalDividendos)}`}>
            R$ {formatMoney(totalDividendos)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Renda passiva apurada</div>
        </div>

        {/* Total Investimento */}
        <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold mb-2">
            <span>TOTAL INVESTIMENTOS</span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg md:text-2xl font-black text-blue-400 truncate" title={`R$ ${formatMoney(totalInvestimento)}`}>
            R$ {formatMoney(totalInvestimento)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Saldo líquido apurado</div>
        </div>
      </div>

      {/* Filter and Action Toolbar */}
      <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-4 shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Month / Year Filter */}
          <div className="flex-1 sm:max-w-xs">
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Filtrar Mês / Período
            </label>
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full bg-[#0F1411] border border-[#243027] text-white text-xs md:text-sm rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
              />
              {monthFilter && (
                <button
                  onClick={() => setMonthFilter('')}
                  className="px-2.5 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700 whitespace-nowrap"
                  title="Ver todos os meses"
                >
                  Todos
                </button>
              )}
            </div>
          </div>

          {/* IRPF Year Selector */}
          <div className="flex-1 sm:max-w-xs">
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Exercício IRPF (Declaração)
            </label>
            <div className="relative">
              <select
                value={reportYear}
                onChange={(e) => setReportYear(parseInt(e.target.value, 10))}
                className="w-full bg-[#0F1411] border border-[#243027] text-emerald-400 font-bold text-xs md:text-sm rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
              >
                {irpfYears.map(y => (
                  <option key={y} value={y}>
                    {y} (Ano-base {y - 1})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleExportPDF}
            disabled={isGeneratingPdf}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#0F1411] hover:bg-emerald-500/15 text-white hover:text-emerald-300 border border-[#243027] hover:border-emerald-500/50 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition"
            title="Baixar Relatório IRPF em PDF"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>{isGeneratingPdf ? 'Gerando...' : 'Baixar PDF'}</span>
          </button>

          <button
            onClick={handleShareReport}
            disabled={isSharing}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#0F1411] hover:bg-emerald-500/15 text-white hover:text-emerald-300 border border-[#243027] hover:border-emerald-500/50 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition"
            title="Compartilhar Relatório IRPF"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>{isSharing ? 'Enviando...' : 'Compartilhar'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#0F1411] hover:bg-emerald-500/15 text-white hover:text-emerald-300 border border-[#243027] hover:border-emerald-500/50 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition"
            title="Exportar Planilha CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container: responsive cards on mobile, grid on desktop */}
      <div className="bg-[#141A16] border border-[#243027] rounded-2xl overflow-hidden shadow-xl">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#0F1411] border-b border-[#243027] text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">Ticker</th>
                <th className="px-5 py-3.5">Nome da Empresa</th>
                <th className="px-5 py-3.5">Classe</th>
                <th className="px-5 py-3.5 text-right">Qtd Carteira</th>
                <th className="px-5 py-3.5 text-right">Total Compras</th>
                <th className="px-5 py-3.5 text-right">Total Vendas</th>
                <th className="px-5 py-3.5 text-right">Dividendos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#243027]">
              {groupedByTicker.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">
                    Nenhum lançamento encontrado para o período selecionado.
                  </td>
                </tr>
              ) : (
                groupedByTicker.map(row => (
                  <tr key={row.ticker} className="hover:bg-zinc-900/40 transition">
                    <td className="px-5 py-3.5 font-bold text-white tracking-wide">{row.ticker}</td>
                    <td className="px-5 py-3.5 text-zinc-300 max-w-[200px] truncate">{row.nome}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#0F1411] text-zinc-300 border border-[#243027]">
                        {row.classe}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-white">{row.qtd}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-emerald-400">R$ {formatMoney(row.compras)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-red-400">R$ {formatMoney(row.vendas)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-yellow-300">R$ {formatMoney(row.dividendos)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards Transformation */}
        <div className="md:hidden divide-y divide-[#243027]">
          {groupedByTicker.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              Nenhum lançamento encontrado para o período selecionado.
            </div>
          ) : (
            groupedByTicker.map(row => (
              <div key={row.ticker} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#243027] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-white">{row.ticker}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#0F1411] border border-[#243027] text-zinc-300 font-bold">
                      {row.classe}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 truncate max-w-[150px]">{row.nome}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Qtd Carteira</span>
                    <span className="font-semibold text-white">{row.qtd}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Compras</span>
                    <span className="font-semibold text-emerald-400">R$ {formatMoney(row.compras)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Vendas</span>
                    <span className="font-semibold text-red-400">R$ {formatMoney(row.vendas)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Dividendos</span>
                    <span className="font-semibold text-yellow-300">R$ {formatMoney(row.dividendos)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
