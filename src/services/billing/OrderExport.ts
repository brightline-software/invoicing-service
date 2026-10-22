// Monthly order export for the accounting team (finance role only).
// Rows are streamed from Postgres straight into the response, so the export
// works for customers with 100k+ orders without loading them into memory.
import type { Writable } from 'node:stream';
import { streamOrdersForMonth } from '../../db/invoice.repository.js';
import { toLocalDate } from '../../utils/dates.js';

export const ORDER_EXPORT_COLUMNS = ['order_id', 'customer', 'amount', 'currency', 'status', 'created_at'] as const;

export function csvEscape(value: unknown): string {
  const text = value == null ? '' : String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsvRow(values: unknown[]): string {
  return values.map(csvEscape).join(',') + '\n';
}

export async function exportOrdersCsv({ month }: { month: string }, out: Writable) {
  out.write(toCsvRow([...ORDER_EXPORT_COLUMNS]));
  for await (const order of streamOrdersForMonth(month)) {
    out.write(
      toCsvRow([
        order.id,
        order.customerName,
        order.amount.toDecimalString(),
        order.amount.currency,
        order.status,
        // Accounting (Bucharest office) asked for local dates in this export.
        toLocalDate(order.createdAt, 'RO'),
      ]),
    );
  }
  out.end();
}
