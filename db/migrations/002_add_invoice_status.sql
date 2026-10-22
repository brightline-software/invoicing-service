alter table invoices add column status text not null default 'draft'
  check (status in ('draft', 'issued', 'sent', 'paid', 'overdue', 'void'));

create index invoices_status_due_idx on invoices (status, due_at);
