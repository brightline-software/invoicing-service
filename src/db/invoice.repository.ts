import { db } from './client.js';
import { Money } from '../utils/money.js';
import type { Invoice, InvoiceStatus } from '../services/billing/invoice.js';

export async function getInvoice(id: string): Promise<Invoice | null> {
  const { rows } = await db.query('select * from invoices where id = $1', [id]);
  return rows[0] ? mapInvoice(rows[0]) : null;
}

export async function listInvoices(filters: { status?: string; customerId?: string }) {
  const { rows } = await db.query(
    `select * from invoices
      where ($1::text is null or status = $1)
        and ($2::uuid is null or customer_id = $2)
      order by issued_at desc
      limit 200`,
    [filters.status ?? null, filters.customerId ?? null],
  );
  return rows.map(mapInvoice);
}

export async function issueDueInvoices(today: Date): Promise<Invoice[]> {
  const { rows } = await db.query('select * from issue_due_invoices($1)', [today]);
  return rows.map(mapInvoice);
}

export async function findOverdueInvoices(today: Date): Promise<Invoice[]> {
  const { rows } = await db.query(
    `select * from invoices where status in ('sent', 'overdue') and due_at < $1`,
    [today],
  );
  return rows.map(mapInvoice);
}

export async function markSent(id: string) {
  await db.query(`update invoices set status = 'sent', sent_at = now() where id = $1`, [id]);
}

export async function markPdfReady(id: string, url: string) {
  await db.query('update invoices set pdf_url = $2 where id = $1', [id, url]);
}

export async function* streamOrdersForMonth(month: string) {
  // Cursor-based read: 500 rows at a time.
  const client = await db.connect();
  try {
    await client.query('begin');
    await client.query(
      `declare orders_cursor cursor for
         select o.id, c.name as customer_name, o.amount_cents, o.currency, o.status, o.created_at
           from orders o join customers c on c.id = o.customer_id
          where to_char(o.created_at, 'YYYY-MM') = $1
          order by o.created_at`,
      [month],
    );
    while (true) {
      const { rows } = await client.query('fetch 500 from orders_cursor');
      if (rows.length === 0) break;
      for (const r of rows) {
        yield {
          id: r.id as string,
          customerName: r.customer_name as string,
          amount: Money.fromCents(r.amount_cents, r.currency),
          status: r.status as string,
          createdAt: r.created_at as Date,
        };
      }
    }
    await client.query('commit');
  } finally {
    client.release();
  }
}

// Rows come untyped from pg; this is the one place we map them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvoice(r: Record<string, any>): Invoice {
  return {
    id: r.id,
    number: r.number,
    customerId: r.customer_id,
    customerName: r.customer_name,
    country: r.country,
    lines: r.lines,
    status: r.status as InvoiceStatus,
    issuedAt: r.issued_at,
    dueAt: r.due_at,
    currency: r.currency,
  };
}
