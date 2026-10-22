// Every morning at 06:00 (INVOICE_CRON) we issue invoices for the subscriptions
// that renew today and hand them to Hermes. The cron itself never sends email.
import { config } from '../../config.js';
import { issueDueInvoices, findOverdueInvoices } from '../../db/invoice.repository.js';
import { enqueueInvoiceEmail, enqueueInvoicePdf, enqueueDunning } from '../../hermes/jobs.js';
import { daysBetween } from '../../utils/dates.js';
import { logger } from '../../utils/logger.js';

export async function runInvoiceCron(today = new Date()) {
  const issued = await issueDueInvoices(today);
  for (const invoice of issued) {
    await enqueueInvoicePdf(invoice.id);
    await enqueueInvoiceEmail(invoice.id, { reason: 'new' });
  }

  // Dunning: reminders at 3, 10 and 21 days after the due date.
  const overdue = await findOverdueInvoices(today);
  for (const invoice of overdue) {
    const late = daysBetween(invoice.dueAt!, today);
    if (late === 3) await enqueueDunning(invoice.id, 1);
    if (late === 10) await enqueueDunning(invoice.id, 2);
    if (late === 21) await enqueueDunning(invoice.id, 3);
  }

  logger.info({ issued: issued.length, overdue: overdue.length }, 'invoice cron finished');
}

export function scheduleInvoiceCron() {
  // Registered as a repeatable job so only one instance runs it, even with 3 pods.
  logger.info({ cron: config.INVOICE_CRON }, 'invoice cron scheduled');
}
