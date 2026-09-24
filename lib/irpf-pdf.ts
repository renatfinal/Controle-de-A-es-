import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from './types';
import { formatMoney } from './formatters';

export interface IrpfPosition {
  ticker: string;
  nome: string;
  classe: string;
  qtd: number;
  custoTotal: number;
  precoMedio: number;
  dividendosAnoBase: number;
}

export function calculateIrpfPositions(transactions: Transaction[], anoExercicio: number): IrpfPosition[] {
  const anoBase = anoExercicio - 1;
  const dataLimite = `${anoBase}-12-31`;

  const txs = transactions.filter(t => t.date <= dataLimite);
  const posicoes: Record<string, {
    ticker: string;
    nome: string;
    classe: string;
    qtd: number;
    custoTotal: number;
    dividendosAnoBase: number;
  }> = {};

  txs.forEach(t => {
    if (!posicoes[t.ticker]) {
      posicoes[t.ticker] = {
        ticker: t.ticker,
        nome: t.nome,
        classe: t.classe || 'Ação',
        qtd: 0,
        custoTotal: 0,
        dividendosAnoBase: 0,
      };
    }

    if (t.tipo === 'ENTRADA') {
      posicoes[t.ticker].qtd += t.qtd;
      posicoes[t.ticker].custoTotal += t.valorTotal;
    } else if (t.tipo === 'SAIDA') {
      // Deduct proportionally based on weighted average cost before sale
      const currentQtd = posicoes[t.ticker].qtd;
      const pm = currentQtd > 0 ? posicoes[t.ticker].custoTotal / currentQtd : 0;
      posicoes[t.ticker].qtd = Math.max(0, currentQtd - t.qtd);
      posicoes[t.ticker].custoTotal = Math.max(0, posicoes[t.ticker].custoTotal - (t.qtd * pm));
    }

    // Dividends received in the base year
    if (t.date.startsWith(`${anoBase}`)) {
      posicoes[t.ticker].dividendosAnoBase += (t.dividendo || 0);
    }
  });

  return Object.values(posicoes)
    .filter(p => p.qtd > 0 || p.dividendosAnoBase > 0)
    .map(p => ({
      ...p,
      precoMedio: p.qtd > 0 ? p.custoTotal / p.qtd : 0,
    }))
    .sort((a, b) => a.ticker.localeCompare(b.ticker));
}

export function generateIrpfPDF(transactions: Transaction[], anoExercicio: number): jsPDF {
  const anoBase = anoExercicio - 1;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const dados = calculateIrpfPositions(transactions, anoExercicio);

  // Brand Header Header Banner
  doc.setFillColor(11, 15, 12);
  doc.rect(0, 0, 210, 36, 'F');

  // Green brand badge
  doc.setFillColor(34, 197, 94);
  doc.roundedRect(14, 8, 12, 12, 2, 2, 'F');
  doc.setTextColor(11, 15, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RF', 17.5, 16.5);

  // Title text
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RF INVESTIMENTOS', 30, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`DECLARAÇÃO DE AJUSTE ANUAL — EXERCÍCIO ${anoExercicio} (ANO-BASE ${anoBase})`, 30, 24);

  doc.setTextColor(156, 163, 175);
  doc.setFontSize(8);
  doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 30, 30);

  let currentY = 44;

  // Section 1: Bens e Direitos
  doc.setTextColor(20, 26, 22);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`1. BENS E DIREITOS — POSIÇÃO EM CUSTO EM 31/12/${anoBase}`, 14, currentY);

  const rowsBens = dados.filter(item => item.qtd > 0).map(item => [
    item.ticker,
    item.nome,
    item.classe,
    String(item.qtd),
    `R$ ${formatMoney(item.precoMedio)}`,
    `R$ ${formatMoney(item.custoTotal)}`
  ]);

  if (rowsBens.length === 0) {
    currentY += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`Nenhuma posição em custódia apurada em 31/12/${anoBase}.`, 14, currentY);
    currentY += 8;
  } else {
    autoTable(doc, {
      startY: currentY + 3,
      head: [['Ticker', 'Discriminação / Empresa', 'Classe', 'Qtd Custódia', 'Preço Médio', 'Custo Total Declarado']],
      body: rowsBens,
      theme: 'grid',
      headStyles: {
        fillColor: [20, 26, 22],
        textColor: [243, 244, 246],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        textColor: [30, 30, 30],
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 22 },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' },
      },
    });

    const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    currentY = (lastTable ? lastTable.finalY : currentY + 30) + 12;
  }

  // Section 2: Proventos e Rendimentos
  doc.setTextColor(20, 26, 22);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`2. RENDIMENTOS E PROVENTOS RECEBIDOS NO ANO-BASE ${anoBase}`, 14, currentY);

  const rowsRend = dados
    .filter(item => item.dividendosAnoBase > 0)
    .map(item => [
      item.ticker,
      item.nome,
      item.classe === 'FII' ? 'Rendimentos Isentos (FII)' : 'Dividendos / JCP',
      `R$ ${formatMoney(item.dividendosAnoBase)}`
    ]);

  const totalProventos = dados.reduce((acc, curr) => acc + curr.dividendosAnoBase, 0);

  if (rowsRend.length === 0) {
    currentY += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`Nenhum provento registrado no ano-base ${anoBase}.`, 14, currentY);
    currentY += 8;
  } else {
    autoTable(doc, {
      startY: currentY + 3,
      head: [['Ticker', 'Empresa Pagadora', 'Enquadramento Fiscal', 'Total Recebido']],
      body: rowsRend,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [11, 15, 12],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        textColor: [30, 30, 30],
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 24 },
        3: { halign: 'right', fontStyle: 'bold' },
      },
    });

    const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    currentY = (lastTable ? lastTable.finalY : currentY + 30) + 8;
  }

  // Summary box
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, currentY, 182, 14, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text(`TOTAL DE PROVENTOS RECEBIDOS NO ANO-BASE: R$ ${formatMoney(totalProventos)}`, 20, currentY + 9);

  return doc;
}

export function downloadIrpfPDF(transactions: Transaction[], anoExercicio: number): void {
  const doc = generateIrpfPDF(transactions, anoExercicio);
  doc.save(`Relatorio_IRPF_Exercicio_${anoExercicio}_RF_Investimentos.pdf`);
}

export async function shareIrpfPDF(transactions: Transaction[], anoExercicio: number): Promise<{ success: boolean; method: string }> {
  const doc = generateIrpfPDF(transactions, anoExercicio);
  const pdfBlob = doc.output('blob');
  const fileName = `Relatorio_IRPF_Exercicio_${anoExercicio}.pdf`;

  if (typeof navigator !== 'undefined' && navigator.canShare) {
    try {
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      if (navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `Relatório IRPF Exercício ${anoExercicio}`,
          text: `Relatório consolidado de Bens, Direitos e Proventos (Ano-base ${anoExercicio - 1}) gerado pelo RF Investimentos.`,
          files: [pdfFile],
        });
        return { success: true, method: 'share-api' };
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        return { success: true, method: 'aborted-by-user' };
      }
    }
  }

  // Fallback to direct download
  doc.save(fileName);
  return { success: true, method: 'download-fallback' };
}
