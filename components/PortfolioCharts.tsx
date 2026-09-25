'use client';

import React, { useState, useMemo } from 'react';
import { Transaction, AssetClass } from '@/lib/types';
import { formatMoney, formatDateBR } from '@/lib/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  DollarSign,
  Wallet,
  Layers,
  Calendar,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface PortfolioChartsProps {
  transactions: Transaction[];
  onNavigateToTab?: (tab: 'dashboard' | 'folders' | 'balancete') => void;
}

const CLASS_COLORS: Record<string, string> = {
  'Ação': '#10B981',       // Emerald
  'FII': '#3B82F6',        // Blue
  'BDR': '#8B5CF6',        // Purple
  'ETF': '#F59E0B',        // Amber
  'Renda Fixa': '#06B6D4', // Cyan
  'Outros': '#9CA3AF',     // Gray
};

const PALETTE = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899', '#14B8A6', '#6366F1'];

// Custom Dark Tooltip for Currency
interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload?: any;
  }>;
  label?: string;
}

const CustomCurrencyTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#141A16] border border-[#243027] p-3 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur-md">
        <p className="font-bold text-zinc-300 pb-1 border-b border-[#243027]">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}:</span>
            </span>
            <span className="font-bold text-white">R$ {formatMoney(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Pie Tooltip
const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#141A16] border border-[#243027] p-3 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur-md">
        <p className="font-bold text-emerald-400">{data.name}</p>
        <p className="text-white font-semibold">R$ {formatMoney(data.value)}</p>
        <p className="text-[11px] text-zinc-400">{data.payload?.percent}% da carteira</p>
      </div>
    );
  }
  return null;
};

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({ transactions }) => {
  const [activeView, setActiveView] = useState<'all' | 'evolution' | 'distribution' | 'dividends'>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | '12m' | '6m' | 'ytd'>('all');

  // Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    if (periodFilter === 'all') return transactions;

    const now = new Date();
    let cutoff = new Date();

    if (periodFilter === '12m') {
      cutoff.setFullYear(now.getFullYear() - 1);
    } else if (periodFilter === '6m') {
      cutoff.setMonth(now.getMonth() - 6);
    } else if (periodFilter === 'ytd') {
      cutoff = new Date(now.getFullYear(), 0, 1);
    }

    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return transactions.filter(t => t.date >= cutoffStr);
  }, [transactions, periodFilter]);

  // 1. Current portfolio summary calculations
  const portfolioSummary = useMemo(() => {
    const assetMap: Record<string, {
      ticker: string;
      nome: string;
      classe: AssetClass;
      qtd: number;
      totalInvestido: number;
      totalVendas: number;
      custoAberto: number;
      dividendos: number;
    }> = {};

    let totalComprasGeral = 0;
    let totalVendasGeral = 0;
    let totalDividendosGeral = 0;

    transactions.forEach(t => {
      if (t.tipo === 'ENTRADA') totalComprasGeral += t.valorTotal;
      if (t.tipo === 'SAIDA') totalVendasGeral += t.valorTotal;
      totalDividendosGeral += (t.dividendo || 0);

      if (!assetMap[t.ticker]) {
        assetMap[t.ticker] = {
          ticker: t.ticker,
          nome: t.nome || t.ticker,
          classe: t.classe || 'Ação',
          qtd: 0,
          totalInvestido: 0,
          totalVendas: 0,
          custoAberto: 0,
          dividendos: 0,
        };
      }

      const item = assetMap[t.ticker];
      if (t.tipo === 'ENTRADA') {
        item.qtd += t.qtd;
        item.totalInvestido += t.valorTotal;
        item.custoAberto += t.valorTotal;
      } else if (t.tipo === 'SAIDA') {
        const pm = item.qtd > 0 ? item.custoAberto / item.qtd : 0;
        item.qtd = Math.max(0, item.qtd - t.qtd);
        item.custoAberto = Math.max(0, item.custoAberto - (t.qtd * pm));
        item.totalVendas += t.valorTotal;
      } else if (t.tipo === 'DIVIDENDO') {
        item.dividendos += (t.dividendo || 0);
      }
    });

    const activeAssets = Object.values(assetMap).filter(a => a.qtd > 0);
    const patrimonioCustodia = activeAssets.reduce((sum, a) => sum + a.custoAberto, 0);

    return {
      patrimonioCustodia,
      totalComprasGeral,
      totalVendasGeral,
      totalDividendosGeral,
      saldoLiquidoInvestido: Math.max(0, totalComprasGeral - totalVendasGeral),
      activeAssets,
      totalAtivosCount: activeAssets.length,
    };
  }, [transactions]);

  // 2. Evolution Timeline Data (Cumulative balance and cumulative dividends)
  const evolutionData = useMemo(() => {
    if (!filteredTransactions.length) return [];

    // Sort transactions chronologically
    const sorted = [...filteredTransactions].sort((a, b) => a.date.localeCompare(b.date));

    let runningInvested = 0;
    let runningDividends = 0;

    // Group transactions by date for a smooth curve
    const dateMap: Record<string, { saldoInvestido: number; dividendosAcumulados: number }> = {};

    sorted.forEach(t => {
      if (t.tipo === 'ENTRADA') {
        runningInvested += t.valorTotal;
      } else if (t.tipo === 'SAIDA') {
        runningInvested = Math.max(0, runningInvested - t.valorTotal);
      } else if (t.tipo === 'DIVIDENDO') {
        runningDividends += (t.dividendo || 0);
      }

      dateMap[t.date] = {
        saldoInvestido: runningInvested,
        dividendosAcumulados: runningDividends,
      };
    });

    return Object.entries(dateMap).map(([date, values]) => ({
      data: formatDateBR(date),
      rawDate: date,
      saldoInvestido: values.saldoInvestido,
      dividendosAcumulados: values.dividendosAcumulados,
    }));
  }, [filteredTransactions]);

  // 3. Asset Class Distribution Data (Pie Chart)
  const classDistributionData = useMemo(() => {
    const classTotals: Record<string, number> = {};

    portfolioSummary.activeAssets.forEach(a => {
      const cls = a.classe || 'Outros';
      classTotals[cls] = (classTotals[cls] || 0) + a.custoAberto;
    });

    const total = portfolioSummary.patrimonioCustodia || 1;

    return Object.entries(classTotals)
      .map(([name, value]) => ({
        name,
        value,
        percent: ((value / total) * 100).toFixed(1),
        color: CLASS_COLORS[name] || '#9CA3AF',
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [portfolioSummary]);

  // 4. Top Assets Distribution Data (Bar Chart)
  const topAssetsData = useMemo(() => {
    return [...portfolioSummary.activeAssets]
      .sort((a, b) => b.custoAberto - a.custoAberto)
      .slice(0, 8)
      .map(a => ({
        ticker: a.ticker,
        nome: a.nome,
        classe: a.classe,
        valor: a.custoAberto,
        qtd: a.qtd,
      }));
  }, [portfolioSummary]);

  // 5. Monthly Dividends Timeline Data (Bar Chart)
  const monthlyDividendsData = useMemo(() => {
    const monthMap: Record<string, number> = {};

    transactions
      .filter(t => t.tipo === 'DIVIDENDO' && (t.dividendo || 0) > 0)
      .forEach(t => {
        const monthKey = t.date.slice(0, 7); // YYYY-MM
        monthMap[monthKey] = (monthMap[monthKey] || 0) + t.dividendo;
      });

    const sortedMonths = Object.keys(monthMap).sort();
    return sortedMonths.map(month => {
      const [year, m] = month.split('-');
      const label = `${m}/${year.slice(2)}`;
      return {
        mes: label,
        rawMonth: month,
        totalDividendo: monthMap[month],
      };
    });
  }, [transactions]);

  const hasData = transactions.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Title & Period Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#243027]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Gráficos & Análise Patrimonial
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Evolução histórica do saldo, divisão por classes e histórico de rendimentos
          </p>
        </div>

        {/* Period and View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <div className="flex items-center bg-[#141A16] border border-[#243027] rounded-xl p-1 text-xs">
            <span className="px-2 text-zinc-500 font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3" />
            </span>
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                periodFilter === 'all'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tudo
            </button>
            <button
              onClick={() => setPeriodFilter('12m')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                periodFilter === '12m'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              12M
            </button>
            <button
              onClick={() => setPeriodFilter('6m')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                periodFilter === '6m'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setPeriodFilter('ytd')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                periodFilter === 'ytd'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ano Atual
            </button>
          </div>

          {/* Section Filter */}
          <div className="flex items-center bg-[#141A16] border border-[#243027] rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveView('all')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                activeView === 'all'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveView('evolution')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                activeView === 'evolution'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Evolução
            </button>
            <button
              onClick={() => setActiveView('distribution')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                activeView === 'distribution'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Alocação
            </button>
            <button
              onClick={() => setActiveView('dividends')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                activeView === 'dividends'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Proventos
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Patrimônio em Custódia</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-black text-white tracking-tight">
              R$ {formatMoney(portfolioSummary.patrimonioCustodia)}
            </span>
            <p className="text-[10px] sm:text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Posição ativa na B3
            </p>
          </div>
        </div>

        <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Proventos Acumulados</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-black text-amber-300 tracking-tight">
              R$ {formatMoney(portfolioSummary.totalDividendosGeral)}
            </span>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-1">
              Rendimento líquido total
            </p>
          </div>
        </div>

        <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Ativos em Carteira</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {portfolioSummary.totalAtivosCount}
            </span>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-1">
              Títulos e ações com saldo
            </p>
          </div>
        </div>

        <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Total de Lançamentos</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {transactions.length}
            </span>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-1">
              Entradas, saídas e dividendos
            </p>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-12 text-center space-y-3">
          <PieChartIcon className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhum dado para exibir gráficos</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Cadastre operações pelo Calendário ou importe uma planilha para visualizar a evolução e alocação da sua carteira.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart 1: Evolução do Saldo da Carteira (Area Chart) */}
          {(activeView === 'all' || activeView === 'evolution') && (
            <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Evolução do Saldo & Proventos da Carteira
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Progressão temporal do capital investido em custódia e proventos acumulados
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-zinc-300">Saldo Investido (R$)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="text-zinc-300">Dividendos Acumulados</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorDiv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2A22" vertical={false} />
                    <XAxis
                      dataKey="data"
                      stroke="#6B7280"
                      fontSize={11}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      stroke="#6B7280"
                      fontSize={11}
                      tickLine={false}
                      dx={-4}
                      tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomCurrencyTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="saldoInvestido"
                      name="Saldo Investido"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorSaldo)"
                    />
                    <Area
                      type="monotone"
                      dataKey="dividendosAcumulados"
                      name="Dividendos Acumulados"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDiv)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Row of Charts: Asset Allocation (Pie) & Top Assets (Bar) */}
          {(activeView === 'all' || activeView === 'distribution') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Asset Class Distribution (Donut Pie Chart) */}
              <div className="lg:col-span-6 bg-[#141A16] border border-[#243027] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-emerald-400" />
                    Distribuição por Classe de Ativos
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Divisão do patrimônio entre Ações, FIIs, BDRs, ETFs e Renda Fixa
                  </p>
                </div>

                <div className="w-full h-64 sm:h-72 flex items-center justify-center">
                  {classDistributionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={classDistributionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={3}
                          stroke="#141A16"
                          strokeWidth={2}
                        >
                          {classDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || PALETTE[index % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs text-zinc-500">Sem ativos em custódia no momento.</p>
                  )}
                </div>

                {/* Custom Legend Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-[#243027]">
                  {classDistributionData.map(item => (
                    <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-[#0F1411]">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="truncate">
                        <span className="text-[11px] font-semibold text-zinc-300 block truncate">{item.name}</span>
                        <span className="text-[10px] text-zinc-400 font-bold">{item.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Assets in Portfolio (Bar Chart) */}
              <div className="lg:col-span-6 bg-[#141A16] border border-[#243027] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    Top Posições da Carteira
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Maiores alocações individuais por capital investido
                  </p>
                </div>

                <div className="w-full h-64 sm:h-72">
                  {topAssetsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topAssetsData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2A22" horizontal={false} />
                        <XAxis
                          type="number"
                          stroke="#6B7280"
                          fontSize={10}
                          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                          type="category"
                          dataKey="ticker"
                          stroke="#E5E7EB"
                          fontSize={11}
                          fontWeight="bold"
                          tickLine={false}
                          width={60}
                        />
                        <Tooltip content={<CustomCurrencyTooltip />} />
                        <Bar
                          dataKey="valor"
                          name="Posição Atual"
                          fill="#10B981"
                          radius={[0, 6, 6, 0]}
                        >
                          {topAssetsData.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={CLASS_COLORS[entry.classe] || PALETTE[index % PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                      Nenhum ativo com saldo aberto.
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-zinc-400 pt-3 border-t border-[#243027] flex items-center justify-between">
                  <span>Valores baseados no preço médio de aquisição</span>
                  <span className="text-emerald-400 font-bold">{topAssetsData.length} ativos exibidos</span>
                </div>
              </div>
            </div>
          )}

          {/* Chart 3: Proventos Mensais (Bar Chart) */}
          {(activeView === 'all' || activeView === 'dividends') && (
            <div className="bg-[#141A16] border border-[#243027] rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    Proventos e Dividendos por Mês
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Total mensal de rendimentos passivos recebidos de Ações e FIIs
                  </p>
                </div>
                <div className="text-xs text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                  Total Geral: R$ {formatMoney(portfolioSummary.totalDividendosGeral)}
                </div>
              </div>

              <div className="w-full h-64 sm:h-72">
                {monthlyDividendsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyDividendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F2A22" vertical={false} />
                      <XAxis
                        dataKey="mes"
                        stroke="#6B7280"
                        fontSize={11}
                        tickLine={false}
                        dy={6}
                      />
                      <YAxis
                        stroke="#6B7280"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(v) => `R$${v.toFixed(0)}`}
                      />
                      <Tooltip content={<CustomCurrencyTooltip />} />
                      <Bar
                        dataKey="totalDividendo"
                        name="Proventos do Mês"
                        fill="#F59E0B"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                    Nenhum provento recebido ainda no período.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
