// Replays one failed Hermes job. Safe to run twice: the job id is the idempotency key.
// Usage: npx tsx scripts/hermes-replay.ts --job email:<invoiceId>
import { hermes } from '../src/hermes/queue.js';

const jobId = process.argv[process.argv.indexOf('--job') + 1];
if (!jobId) {
  console.error('Usage: npx tsx scripts/hermes-replay.ts --job <jobId>');
  process.exit(1);
}

const job = await hermes.getJob(jobId);
if (!job) {
  console.error(`No Hermes job with id ${jobId}`);
  process.exit(1);
}
await job.retry('failed');
console.log(`Replayed ${jobId} (${job.name})`);
process.exit(0);
