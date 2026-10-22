create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country char(2) not null,
  billing_email text not null,
  payment_terms_days int not null default 30
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  customer_id uuid not null references customers(id),
  lines jsonb not null default '[]',
  currency char(3) not null,
  issued_at timestamptz,
  due_at timestamptz,
  sent_at timestamptz,
  pdf_url text
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  amount_cents bigint not null,
  currency char(3) not null,
  status text not null,
  created_at timestamptz not null default now()
);
