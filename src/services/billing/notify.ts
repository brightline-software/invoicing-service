// Emails to customers. Only called from the Hermes worker (see ADR-007).
import { getInvoice, markSent } from '../../db/invoice.repository.js';
import { invoiceTotals } from './invoice.js';
import { config } from '../../config.js';
import { toLocalDate } from '../../utils/dates.js';
import { logger } from '../../utils/logger.js';

const DUNNING_SUBJECTS = {
  1: 'Friendly reminder: invoice {number} is due',
  2: 'Second reminder: invoice {number} is overdue',
  3: 'Final notice: invoice {number}',
} as const;

async function send(to: string, subject: string, body: string) {
  if (!config.MAILER_API_KEY) {
    logger.warn({ to, subject }, 'MAILER_API_KEY not set, email printed instead of sent');
    return;
  }
  // The mailer client lives in @brightline/mailer (internal package).
}

export async function sendInvoiceEmail(invoiceId: string) {
  const invoice = await getInvoice(invoiceId);
  if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);
  const { gross } = invoiceTotals(invoice);
  await send(
    `billing+${invoice.customerId}@customers.brightline.example`,
    `Invoice ${invoice.number}`,
    `Your invoice of ${gross.format()} is due on ${toLocalDate(invoice.dueAt!, invoice.country)}.`,
  );
  await markSent(invoiceId);
}

export async function sendDunningReminder(invoiceId: string, step: 1 | 2 | 3) {
  const invoice = await getInvoice(invoiceId);
  if (!invoice || invoice.status === 'paid') return;
  await send(
    `billing+${invoice.customerId}@customers.brightline.example`,
    DUNNING_SUBJECTS[step].replace('{number}', invoice.number),
    `Invoice ${invoice.number} was due on ${toLocalDate(invoice.dueAt!, invoice.country)}.`,
  );
}
