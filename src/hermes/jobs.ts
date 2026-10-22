import { hermes, DEFAULT_JOB_OPTIONS } from './queue.js';

export type HermesJob =
  | { name: 'invoice.email'; data: { invoiceId: string; reason: 'new' | 'manual-resend' } }
  | { name: 'invoice.pdf'; data: { invoiceId: string } }
  | { name: 'invoice.dunning'; data: { invoiceId: string; step: 1 | 2 | 3 } };

// The idempotency key is the jobId: Hermes ignores a second job with the same id,
// so a retried cron run never emails a customer twice.
export async function enqueueInvoiceEmail(invoiceId: string, opts: { reason: 'new' | 'manual-resend' }) {
  const jobId = opts.reason === 'new' ? `email:${invoiceId}` : `email:${invoiceId}:${Date.now()}`;
  await hermes.add('invoice.email', { invoiceId, reason: opts.reason }, { ...DEFAULT_JOB_OPTIONS, jobId });
}

export async function enqueueInvoicePdf(invoiceId: string) {
  await hermes.add('invoice.pdf', { invoiceId }, { ...DEFAULT_JOB_OPTIONS, jobId: `pdf:${invoiceId}` });
}

export async function enqueueDunning(invoiceId: string, step: 1 | 2 | 3) {
  await hermes.add('invoice.dunning', { invoiceId, step }, { ...DEFAULT_JOB_OPTIONS, jobId: `dunning:${invoiceId}:${step}` });
}
