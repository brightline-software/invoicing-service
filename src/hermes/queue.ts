// Hermes is the invoicing queue. Anything slow or that talks to the outside
// world (emails, PDF rendering, payment reminders) goes through Hermes, never
// inside an HTTP request. See docs/adr/ADR-007-hermes-for-invoice-delivery.md.
import { Queue, type JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config.js';

export const connection = new IORedis(config.HERMES_URL, { maxRetriesPerRequest: null });

export const hermes = new Queue(config.HERMES_QUEUE, { connection });

export const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 5,
  backoff: { type: 'exponential', delay: 30_000 },
  removeOnComplete: 1000,
  // Failed jobs stay so they can be inspected in the dead-letter view (DLQ).
  removeOnFail: false,
};
