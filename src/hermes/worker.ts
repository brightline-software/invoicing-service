import { Worker } from 'bullmq';
import { connection } from './queue.js';
import { config } from '../config.js';
import { sendInvoiceEmail, sendDunningReminder } from '../services/billing/notify.js';
import { renderInvoicePdf } from '../services/billing/invoice.js';
import { logger } from '../utils/logger.js';

const worker = new Worker(
  config.HERMES_QUEUE,
  async (job) => {
    switch (job.name) {
      case 'invoice.email':
        return sendInvoiceEmail(job.data.invoiceId);
      case 'invoice.pdf':
        return renderInvoicePdf(job.data.invoiceId);
      case 'invoice.dunning':
        return sendDunningReminder(job.data.invoiceId, job.data.step);
      default:
        throw new Error(`Unknown Hermes job: ${job.name}`);
    }
  },
  { connection, concurrency: 8 },
);

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, attempts: job?.attemptsMade, err }, 'Hermes job failed');
});

logger.info({ queue: config.HERMES_QUEUE }, 'Hermes worker started');
