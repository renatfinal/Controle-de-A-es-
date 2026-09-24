import { Transaction, UserProfile } from './types';

const DATA_KEY = 'invest_app_data';
const USER_KEY = 'invest_app_user';

export const INITIAL_DEMO_DATA: Transaction[] = [
  {
    id: 1710001000000,
    date: '2025-01-15',
    nome: 'Petróleo Brasileiro S.A.',
    ticker: 'PETR4',
    classe: 'Ação',
    qtd: 100,
    valorUn: 36.50,
    valorTotal: 3650.00,
    tipo: 'ENTRADA',
    dividendo: 0,
  },
  {
    id: 1710002000000,
    date: '2025-01-20',
    nome: 'CSHG Logística FII',
    ticker: 'HGLG11',
    classe: 'FII',
    qtd: 50,
    valorUn: 162.00,
    valorTotal: 8100.00,
    tipo: 'ENTRADA',
    dividendo: 0,
  },
  {
    id: 1710003000000,
    date: '2025-02-14',
    nome: 'CSHG Logística FII',
    ticker: 'HGLG11',
    classe: 'FII',
    qtd: 0,
    valorUn: 0,
    valorTotal: 0,
    tipo: 'DIVIDENDO',
    dividendo: 55.00,
  },
  {
    id: 1710004000000,
    date: '2025-02-22',
    nome: 'Vale S.A.',
    ticker: 'VALE3',
    classe: 'Ação',
    qtd: 80,
    valorUn: 62.40,
    valorTotal: 4992.00,
    tipo: 'ENTRADA',
    dividendo: 0,
  },
  {
    id: 1710005000000,
    date: '2025-03-10',
    nome: 'Maxi Renda FII',
    ticker: 'MXRF11',
    classe: 'FII',
    qtd: 200,
    valorUn: 10.35,
    valorTotal: 2070.00,
    tipo: 'ENTRADA',
    dividendo: 0,
  },
  {
    id: 1710006000000,
    date: '2025-03-15',
    nome: 'Maxi Renda FII',
    ticker: 'MXRF11',
    classe: 'FII',
    qtd: 0,
    valorUn: 0,
    valorTotal: 0,
    tipo: 'DIVIDENDO',
    dividendo: 22.00,
  },
  {
    id: 1710007000000,
    date: '2025-04-05',
    nome: 'Itaú Unibanco',
    ticker: 'ITUB4',
    classe: 'Ação',
    qtd: 120,
    valorUn: 33.80,
    valorTotal: 4056.00,
    tipo: 'ENTRADA',
    dividendo: 0,
  },
  {
    id: 1710008000000,
    date: '2025-04-18',
    nome: 'Petróleo Brasileiro S.A.',
    ticker: 'PETR4',
    classe: 'Ação',
    qtd: 0,
    valorUn: 0,
    valorTotal: 0,
    tipo: 'DIVIDENDO',
    dividendo: 145.20,
  }
];

export function loadTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) {
      // Seed with initial demo portfolio so app isn't blank
      localStorage.setItem(DATA_KEY, JSON.stringify(INITIAL_DEMO_DATA));
      return INITIAL_DEMO_DATA;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading transactions from localStorage:', err);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving transactions to localStorage:', err);
  }
}

export function loadUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading profile from localStorage:', err);
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving profile to localStorage:', err);
  }
}

export function exportBackupJSON(transactions: Transaction[], profile?: UserProfile | null): void {
  const payload = {
    appName: 'RF Investimentos',
    version: '1.0',
    exportDate: new Date().toISOString(),
    profile: profile || null,
    transactions,
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `RF_Investimentos_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportTransactionsCSV(transactions: Transaction[]): void {
  const headers = ['ID', 'Data', 'Ticker', 'Nome', 'Classe', 'Tipo', 'Quantidade', 'Valor Unitario', 'Valor Total', 'Dividendos'];
  const rows = transactions.map(t => [
    t.id,
    t.date,
    t.ticker,
    `"${(t.nome || '').replace(/"/g, '""')}"`,
    t.classe || 'Ação',
    t.tipo,
    t.qtd,
    (t.valorUn || 0).toFixed(2).replace('.', ','),
    (t.valorTotal || 0).toFixed(2).replace('.', ','),
    (t.dividendo || 0).toFixed(2).replace('.', ',')
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Transacoes_RF_Investimentos_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
