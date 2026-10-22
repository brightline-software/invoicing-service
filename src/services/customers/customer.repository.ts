import { db } from '../../db/client.js';

export interface Customer {
  id: string;
  name: string;
  country: string;
  billingEmail: string;
  paymentTermsDays: number;
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const { rows } = await db.query(
    `select id, name, country, billing_email as "billingEmail", payment_terms_days as "paymentTermsDays"
       from customers where id = $1`,
    [id],
  );
  return rows[0] ?? null;
}
