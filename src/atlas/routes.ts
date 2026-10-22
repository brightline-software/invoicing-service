import type { Express } from 'express';
import { requireRole } from './auth.js';
import { listInvoices, getInvoice } from '../db/invoice.repository.js';
import { exportOrdersCsv } from '../services/billing/OrderExport.js';
import { enqueueInvoiceEmail } from '../hermes/jobs.js';

export function registerRoutes(app: Express) {
  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.get('/invoices', async (req, res) => {
    const invoices = await listInvoices({
      status: req.query.status as string | undefined,
      customerId: req.query.customerId as string | undefined,
    });
    res.json({ invoices });
  });

  app.get('/invoices/:id', async (req, res) => {
    const invoice = await getInvoice(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ invoice });
  });

  app.post('/invoices/:id/resend', requireRole('support'), async (req, res) => {
    await enqueueInvoiceEmail(req.params.id, { reason: 'manual-resend' });
    res.status(202).json({ queued: true });
  });

  // Finance downloads all orders of a month as CSV for the accounting team.
  app.get('/orders/export', requireRole('finance'), async (req, res) => {
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader('content-disposition', 'attachment; filename="orders.csv"');
    await exportOrdersCsv({ month: String(req.query.month) }, res);
  });
}
