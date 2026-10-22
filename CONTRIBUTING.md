# Contributing to invoicing-service

Thanks for helping! This page explains how we work on this repository.
If something here is unclear, ask in `#team-invoicing`. Nobody minds questions.

## Branches and commits

- Branch from `main`: `feature/142-invoice-csv`, `fix/dunning-timezone`.
- Write commit messages in the imperative: "Add CSV export", not "Added CSV export".
- Mention the issue number in the PR title: `#142 Add invoice CSV export`.
- Keep pull requests small. Under 400 changed lines is easier to review.

## Code style

- TypeScript strict mode. No `any` in new code unless you explain why in a comment.
- Money is always `Money` in cents (`src/utils/money.ts`). Never use floats for amounts.
- Slow work (emails, PDFs, anything external) goes through **Hermes**, never inside an HTTP request. See ADR-007.
- Name variables for what they hold: `row`, `invoice`, `customer`. No single letters except loop indexes.

## Performance

- Exports and reports must **stream** rows (see `OrderExport.ts`). Some customers have more than
  100,000 invoices, so building the whole file in memory will crash the pod.
- Database queries in a loop need a reason. Prefer one query with `where id = any($1)`.

## Tests

- Every bug fix comes with a test that fails without the fix.
- New code in `src/services/` needs unit tests in `tests/`.
- Run `npm test` and `npm run lint` before you push. CI runs both.

## Review conventions

We prefix review comments so everyone knows what is required:

| Prefix | Meaning | Must the author act? |
|---|---|---|
| `blocking:` | A real problem: bug, security, data loss, performance | Yes, before merge |
| `nit:` | Small style or naming preference | No, author decides |
| `suggestion:` | An idea that could make the code better | No, author decides |
| `question:` | The reviewer wants to understand something | Answer it; change code only if the answer shows a problem |

A comment **without a prefix** is treated as a question. Answer it in the thread before you change code.

Reviewers answer within **one working day**. If your PR waits longer, mention the reviewer in `#team-invoicing`.
Be kind in reviews: comment on the code, not on the person.

## Before you merge

- [ ] At least one approval from a **CODEOWNER** of the files you changed (see `.github/CODEOWNERS`)
- [ ] CI is green
- [ ] The acceptance criteria in the issue are checked off
- [ ] If you changed Hermes jobs or the worker, you updated [docs/runbooks/hermes.md](docs/runbooks/hermes.md)
- [ ] All `blocking:` comments are resolved

We squash-merge. The PR title becomes the commit message.

## Migrations

SQL migrations live in `db/migrations/` and are named `NNN_short_description.sql`.
Never edit a migration that is already on `main`; add a new one.
