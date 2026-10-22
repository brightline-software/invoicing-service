# Runbook: Hermes (invoicing queue)

Use this page when `#invoicing-alerts` posts a Hermes alert, or when customers say they did not get an invoice.

## Alerts

| Alert | Meaning | First thing to check |
|---|---|---|
| `HermesQueueDepthHigh` | More than 5,000 jobs waiting for 10 minutes | Is the worker running? Beacon → "Invoicing / Hermes" → Workers panel |
| `HermesFailedJobs` | More than 20 jobs failed in 15 minutes | The error in the failed jobs (see below). Often the mail provider is down |
| `InvoiceCronMissed` | The 06:00 cron did not finish by 06:30 | Logs in Beacon: `app="invoicing-service" msg="invoice cron finished"` |

## Inspect failed jobs

1. Open Beacon → "Invoicing / Hermes" → **Dead-letter (DLQ)** panel.
2. Each failed job shows its name, invoice id, attempts and last error.
3. If the error is temporary (timeout, 5xx from the mailer), replay the job (below).
4. If the error is a bug (e.g. `No VAT rate configured for XX`), do not replay. Open an issue and tag `@brightline-radu`.

## Replay a job

From a pod shell: `npx tsx scripts/hermes-replay.ts --job <jobId>`
Replaying is safe: the job id is the idempotency key, so a customer never gets two copies.

## Resend one invoice by hand

Support can click **Resend** on the Invoices page. Engineers can call
`POST /invoices/:id/resend` with the `support` role.

## Changing jobs

If you add or change a Hermes job, update this runbook in the same PR (see CONTRIBUTING.md, "Before you merge").
