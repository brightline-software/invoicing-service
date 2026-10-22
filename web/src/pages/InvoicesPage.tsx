import { useEffect, useState } from 'react';
import { fetchInvoices, resendInvoice, type InvoiceRow } from '../api/invoices';
import { InvoiceTable } from '../components/InvoiceTable';
import { useSession } from '@brightline/web-session';

export function InvoicesPage() {
  const { roles } = useSession();
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices({ status }).then(setRows).catch((e) => setError(e.message));
  }, [status]);

  const canResend = roles.includes('support') || roles.includes('admin');

  return (
    <main>
      <header className="page-header">
        <h1>Invoices</h1>
        {/* Toolbar: filters on the left, actions on the right. */}
        <div className="toolbar">
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </label>
        </div>
      </header>
      {error && <p role="alert">{error}</p>}
      <InvoiceTable rows={rows} onResend={canResend ? (id) => resendInvoice(id) : undefined} />
    </main>
  );
}
