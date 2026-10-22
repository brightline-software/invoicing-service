// Demo data for local development: 3 customers, 40 invoices, 300 orders.
import { db } from '../src/db/client.js';

const CUSTOMERS = [
  { name: 'Northwind Logistics', country: 'RO', email: 'accounts@northwind.example' },
  { name: 'Acme, Inc.', country: 'DE', email: 'billing@acme.example' },
  { name: 'Le Petit Studio', country: 'FR', email: 'compta@petitstudio.example' },
];

async function main() {
  for (const c of CUSTOMERS) {
    const { rows } = await db.query(
      'insert into customers (name, country, billing_email) values ($1, $2, $3) returning id',
      [c.name, c.country, c.email],
    );
    const customerId = rows[0].id;
    for (let i = 0; i < 100; i++) {
      await db.query(
        `insert into orders (customer_id, amount_cents, currency, status, created_at)
         values ($1, $2, 'EUR', $3, now() - ($4 || ' days')::interval)`,
        [customerId, 1_000 + Math.floor(Math.random() * 90_000), i % 7 === 0 ? 'refunded' : 'completed', i],
      );
    }
  }
  console.log('Seed complete: 3 customers, 300 orders. Invoices are created by the cron.');
  await db.end();
}

main();
