// Calls go through Atlas; the browser session cookie is enough.
export interface InvoiceRow {
  id: string;
  number: string;
  customerName: string;
  status: string;
  issuedAt: string | null;
  dueAt: string | null;
  totalCents: number;
  currency: string;
}

export async function fetchInvoices(filters: { status?: string; customerId?: string }): Promise<InvoiceRow[]> {
  const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]);
  const res = await fetch(`/api/invoicing/invoices?${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Could not load invoices (${res.status})`);
  return (await res.json()).invoices;
}

export async function resendInvoice(id: string) {
  const res = await fetch(`/api/invoicing/invoices/${id}/resend`, { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new Error(`Could not resend invoice (${res.status})`);
}
