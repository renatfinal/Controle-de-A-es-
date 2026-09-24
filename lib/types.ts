export type TransactionType = 'ENTRADA' | 'SAIDA' | 'DIVIDENDO';
export type AssetClass = 'Ação' | 'FII' | 'BDR' | 'ETF' | 'Renda Fixa' | 'Outros';

export interface Transaction {
  id: number;
  date: string; // YYYY-MM-DD
  nome: string;
  ticker: string;
  classe: AssetClass;
  qtd: number;
  valorUn: number;
  valorTotal: number;
  tipo: TransactionType;
  dividendo: number;
  observacoes?: string;
}

export interface UserProfile {
  nome: string;
  telefone: string;
  email: string;
  senha: string;
}

export interface AssetSummary {
  ticker: string;
  nome: string;
  classe: AssetClass;
  qtd: number;
  investidoTotal: number;
  precoMedio: number;
  totalCompras: number;
  totalVendas: number;
  dividendosTotal: number;
  transacoesCount: number;
  saldoFinanceiro: number;
}
