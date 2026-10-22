import type { InvoiceRow } from '../api/invoices';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  issued: 'Issued',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
};

export function InvoiceTable({ rows, onResend }: { rows: InvoiceRow[]; onResend?: (id: string) => void }) {
  return (
    <table className="invoice-table">
      <caption>Invoices</caption>
      <thead>
        <tr>
          <th scope="col">Number</th>
          <th scope="col">Customer</th>
          <th scope="col">Amount</th>
          <th scope="col">Status</th>
          <th scope="col">Due</th>
          {onResend && <th scope="col">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.number}</td>
            <td>{row.customerName}</td>
            <td>{(row.totalCents / 100).toFixed(2)} {row.currency}</td>
            <td>{STATUS_LABEL[row.status] ?? row.status}</td>
            <td>{row.dueAt ?? '—'}</td>
            {onResend && (
              <td>
                <button type="button" onClick={() => onResend(row.id)}>Resend</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
