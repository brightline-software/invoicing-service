import { listInvoices } from '../../db/invoice.repository.js';
import { invoiceTotals } from './invoice.js';
import { toIsoDate } from '../../utils/dates.js';

// Support sends customers the list of all their invoices when they ask for it.
export async function exportCustomerInvoicesCsv(customerId: string): Promise<string> {
  const invoices = await listInvoices({ customerId });
  let csv = 'number,status,issued,due,total,currency\n';
  for (const x of invoices) {
    const { gross } = invoiceTotals(x);
    const issued = x.issuedAt ? toIsoDate(x.issuedAt) : '';
    const due = x.dueAt ? toIsoDate(x.dueAt) : '';
    csv += [x.number, x.status, issued, due, gross.toDecimalString(), x.currency].join(',') + '\n';
  }
  return csv;
}
