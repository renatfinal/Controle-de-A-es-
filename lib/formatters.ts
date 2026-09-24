export function formatMoney(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0,00';
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseCurrencyValue(str: string | number): number {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  // Remove currency symbol, spaces, points (thousand separators), replace comma with dot
  const clean = str.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(clean) || 0;
}

export function maskCurrency(rawValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, '');
  if (!digitsOnly) return '';
  const valNumber = parseInt(digitsOnly, 10) / 100;
  return formatMoney(valNumber);
}

export function formatPhone(phone: string): string {
  let v = phone.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 10) {
    return v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (v.length > 6) {
    return v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  } else if (v.length > 2) {
    return v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
  } else if (v.length > 0) {
    return v.replace(/^(\d*)$/, '($1');
  }
  return v;
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
