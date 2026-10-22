# invoicing-service

Part of the **Brightline Software** billing platform. This service creates invoices for
our customers' subscriptions, sends them by email through **Hermes** (our invoicing queue),
reminds customers about unpaid invoices (dunning) and exports orders for the finance team.

All traffic reaches the service through **Atlas**, the company API gateway.

## Getting started

1. Read [ARCHITECTURE.md](ARCHITECTURE.md) (10 minutes) to see how Atlas, the API and Hermes fit together.
2. Follow [docs/setup.md](docs/setup.md) to run the service locally. It takes about 45 minutes the first time.
3. If something fails, check [docs/known-issues.md](docs/known-issues.md) before asking.
4. Read [CONTRIBUTING.md](CONTRIBUTING.md) before you open your first pull request.
5. Pick an issue labelled `good first issue`. Your buddy will review your first PR.

## Project layout

| Path | What lives there |
|---|---|
| `src/atlas/` | Middleware that trusts Atlas identity headers, plus the HTTP routes |
| `src/hermes/` | Hermes queue, job definitions and the worker |
| `src/services/billing/` | Invoices, VAT, emails (`notify.ts`), the daily cron (`invoice.cron.ts`), order export (`OrderExport.ts`) |
| `src/services/customers/` | Customer lookups |
| `src/db/` | Postgres client and repositories |
| `db/migrations/` | SQL migrations, run in order |
| `web/src/` | The Invoices page used by finance and support |
| `docs/` | Setup guide, known issues, ADRs, runbooks |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | API with reload on port 4100 |
| `npm run worker` | Hermes worker (needs Redis) |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Runs the migrations in `db/migrations/` |

## Useful links

- Dashboards: **Beacon** → "Invoicing / Hermes" board (queue depth, failed jobs, cron runs)
- Runbook: [docs/runbooks/hermes.md](docs/runbooks/hermes.md)
- Decisions: [docs/adr/](docs/adr/)
- Slack: `#team-invoicing` for questions, `#invoicing-alerts` for alerts (read-only)
