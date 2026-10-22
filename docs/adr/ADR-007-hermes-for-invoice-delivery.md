# ADR-007: Send invoices through Hermes, not inside requests

- **Status:** Accepted
- **Date:** 2025-03-11
- **Deciders:** Ana (Engineering Manager, billing), Radu (Senior Engineer), Ioana (Senior Engineer)

## Context

Until March 2025 the invoicing service sent invoice emails directly inside the HTTP request
and inside the daily cron. Three problems kept coming back:

1. When the mail provider was slow, the cron ran for more than 2 hours and overlapped with the next run.
2. When the cron crashed halfway, a restart sent the same invoice twice to some customers.
3. Support had no way to see which emails failed.

## Decision

All slow or external work goes through **Hermes**, a Redis-backed BullMQ queue dedicated to invoicing:

- The API and the cron only **enqueue** jobs (`invoice.email`, `invoice.pdf`, `invoice.dunning`).
- A separate Hermes worker processes them, 8 at a time.
- The job id is the idempotency key (`email:<invoiceId>`), so the same invoice is never emailed twice.
- Failed jobs retry 5 times with exponential backoff (30 s base) and then stay in the dead-letter view.

## Consequences

- The cron now finishes in under 2 minutes.
- Emails arrive a few seconds later than before. Nobody has complained.
- We run one more process (the worker) in every environment, including local setup.
- On-call engineers must know how to inspect and replay failed jobs. See `docs/runbooks/hermes.md`.

## Alternatives considered

- **Postgres-based job table:** no new infrastructure, but we would have to write retries and locking ourselves.
- **The company-wide event bus:** too heavy for one team; delivery order is not guaranteed.
