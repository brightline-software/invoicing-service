import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(4100),
  DATABASE_URL: z.string().url(),
  HERMES_URL: z.string().min(1, 'HERMES_URL is not set. Is Redis running? See docs/setup.md step 5.'),
  HERMES_QUEUE: z.string().default('invoices'),
  ATLAS_DEV_TOKEN: z.string().optional(),
  ATLAS_PUBLIC_KEY: z.string().optional(),
  MAILER_API_KEY: z.string().optional(),
  INVOICE_CRON: z.string().default('0 6 * * *'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const config = schema.parse(process.env);
export type Config = typeof config;
