import { Money } from '../../utils/money.js';
import { calculateVat } from './tax.js';
import { getInvoice, markPdfReady } from '../../db/invoice.repository.js';

export type InvoiceStatus = 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'void';

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: Money;
}

export interface Invoice {
  id: string;
  number: string; // BL-2026-000123
  customerId: string;
  customerName: string;
  country: string; // ISO 3166-1 alpha-2
  lines: InvoiceLine[];
  status: InvoiceStatus;
  issuedAt: Date | null;
  dueAt: Date | null;
  currency: 'EUR' | 'RON' | 'USD';
}

export function invoiceTotals(invoice: Invoice) {
  const net = invoice.lines.reduce(
    (sum, line) => sum.add(line.unitPrice.multiply(line.quantity)),
    Money.zero(invoice.currency),
  );
  const vat = calculateVat(net, invoice.country);
  return { net, vat, gross: net.add(vat) };
}

export async function renderInvoicePdf(invoiceId: string) {
  const invoice = await getInvoice(invoiceId);
  if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);
  // PDF rendering is done by the shared document service; we only store the link.
  const url = `https://docs.internal.brightline.example/invoices/${invoice.number}.pdf`;
  await markPdfReady(invoiceId, url);
  return url;
}
