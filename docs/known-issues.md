# Known issues (local setup)

Search this page for the exact error text you see. Each entry says why it happens and how to fix it.
If your error is not here, ask in `#team-invoicing` and add it here once it is solved.

## `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Why:** Postgres is not running, or another Postgres already uses port 5432.
**Fix:** run `docker compose up -d` and check `docker compose ps`. If port 5432 is taken by a local
Postgres, stop it (`brew services stop postgresql` or `sudo systemctl stop postgresql`) or change the
port in `docker-compose.yml` and `DATABASE_URL`.

## `ZodError: HERMES_URL is not set. Is Redis running?`

**Why:** your `.env` file is missing or was not loaded, so the service cannot find Hermes.
**Fix:** run `cp .env.example .env` (setup step 4) from the repository root, then restart `npm run dev`.

## `ReconnectionError: connect ECONNREFUSED 127.0.0.1:6379`

**Why:** Redis (the storage behind Hermes) is not running.
**Fix:** `docker compose up -d redis`. The worker reconnects on its own after Redis starts.

## `401 {"error":"Request did not come through Atlas"}`

**Why:** locally there is no Atlas gateway to sign the request.
**Fix:** send the dev token: `-H "Authorization: Bearer local-dev-only"`. The token must match
`ATLAS_DEV_TOKEN` in `.env`. It never works when `NODE_ENV=production`.

## `npm ERR! engine Unsupported engine` or `SyntaxError: Unexpected token 'with'`

**Why:** you are on Node 18, 21 or 22. Some dependencies only support Node 20.
**Fix:** `nvm install 20 && nvm use 20`, delete `node_modules`, then run `npm ci` again.

## `error: relation "invoices" does not exist`

**Why:** the migrations did not run, or they ran against another database.
**Fix:** check that `DATABASE_URL` points to `localhost:5432/invoicing`, then run `npm run db:migrate`.

## `npm ERR! 404 Not Found - GET https://registry.npmjs.org/@brightline%2fmailer`

**Why:** `@brightline/mailer` is an internal package and npm looks for it on the public registry.
**Fix:** add the internal registry to `~/.npmrc`: `@brightline:registry=https://npm.internal.brightline.example`.
You need a token; ask your buddy to request one for you.

## Hermes jobs stay in `waiting` and never run

**Why:** the worker is not started, or it listens to another queue name.
**Fix:** start `npm run worker` and check that `HERMES_QUEUE` is the same (`invoices`) for the API and the worker.
