import express from 'express';
import { config } from './config.js';
import { atlasAuth } from './atlas/auth.js';
import { registerRoutes } from './atlas/routes.js';
import { scheduleInvoiceCron } from './services/billing/invoice.cron.js';
import { logger } from './utils/logger.js';

const app = express();
app.use(express.json());

// Every request reaches us through Atlas (the API gateway). Atlas adds the user headers.
app.use(atlasAuth);
registerRoutes(app);

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'invoicing-service listening');
});

scheduleInvoiceCron();
