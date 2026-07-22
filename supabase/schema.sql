create extension if not exists "pgcrypto";

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  billing_address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_user_id_idx on public.customers(user_id);
create index if not exists customers_name_idx on public.customers(name);
create unique index if not exists customers_id_user_id_idx on public.customers(id, user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists customers_set_updated_at on public.customers;

create trigger customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

alter table public.customers enable row level security;

drop policy if exists "Users can view their own customers" on public.customers;
create policy "Users can view their own customers"
on public.customers for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own customers" on public.customers;
create policy "Users can create their own customers"
on public.customers for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own customers" on public.customers;
create policy "Users can update their own customers"
on public.customers for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own customers" on public.customers;
create policy "Users can delete their own customers"
on public.customers for delete
using (auth.uid() = user_id);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  invoice_number text not null,
  status text not null default 'draft' check (status in ('draft', 'pending', 'paid', 'overdue')),
  issue_date date not null default current_date,
  due_date date not null,
  payment_terms text not null default 'due_on_receipt',
  payment_reference text,
  paid_at timestamptz,
  currency text not null default 'USD',
  tax_rate numeric(8, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  subtotal numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, invoice_number)
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.invoice_activities (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  receipt_number text not null,
  payment_method text not null default 'Manual payment',
  payment_reference text not null,
  amount numeric(12, 2) not null,
  currency text not null default 'USD',
  description text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, receipt_number),
  unique (user_id, payment_reference)
);

alter table public.invoices
add column if not exists payment_terms text not null default 'due_on_receipt',
add column if not exists payment_reference text,
add column if not exists paid_at timestamptz;

alter table public.invoices
drop constraint if exists invoices_payment_terms_check;

alter table public.invoices
add constraint invoices_payment_terms_check
check (payment_terms in ('due_on_receipt', 'net_7', 'net_15', 'net_30', 'net_60', 'custom'));

alter table public.invoices
drop constraint if exists invoices_amounts_non_negative_check;

alter table public.invoices
add constraint invoices_amounts_non_negative_check
check (
  tax_rate >= 0
  and discount >= 0
  and subtotal >= 0
  and tax_amount >= 0
  and total >= 0
);

alter table public.invoice_items
drop constraint if exists invoice_items_amounts_non_negative_check;

alter table public.invoice_items
add constraint invoice_items_amounts_non_negative_check
check (
  quantity > 0
  and unit_price >= 0
  and line_total >= 0
  and position >= 0
);

create index if not exists invoices_user_id_idx on public.invoices(user_id);
create index if not exists invoices_customer_id_idx on public.invoices(customer_id);
create index if not exists invoices_status_idx on public.invoices(status);
create unique index if not exists invoices_id_user_id_idx on public.invoices(id, user_id);
create index if not exists invoice_items_invoice_id_idx on public.invoice_items(invoice_id);
create index if not exists invoice_items_user_id_idx on public.invoice_items(user_id);
create index if not exists invoice_activities_invoice_id_idx on public.invoice_activities(invoice_id);
create index if not exists invoice_activities_user_id_idx on public.invoice_activities(user_id);
create index if not exists payments_invoice_id_idx on public.payments(invoice_id);
create index if not exists payments_user_id_idx on public.payments(user_id);

alter table public.invoices
drop constraint if exists invoices_customer_owner_fk;

alter table public.invoices
add constraint invoices_customer_owner_fk
foreign key (customer_id, user_id)
references public.customers(id, user_id)
on delete restrict;

alter table public.invoice_items
drop constraint if exists invoice_items_invoice_owner_fk;

alter table public.invoice_items
add constraint invoice_items_invoice_owner_fk
foreign key (invoice_id, user_id)
references public.invoices(id, user_id)
on delete cascade;

alter table public.invoice_activities
drop constraint if exists invoice_activities_invoice_owner_fk;

alter table public.invoice_activities
add constraint invoice_activities_invoice_owner_fk
foreign key (invoice_id, user_id)
references public.invoices(id, user_id)
on delete cascade;

alter table public.payments
drop constraint if exists payments_invoice_owner_fk;

alter table public.payments
add constraint payments_invoice_owner_fk
foreign key (invoice_id, user_id)
references public.invoices(id, user_id)
on delete cascade;

alter table public.payments
drop constraint if exists payments_amount_positive_check;

alter table public.payments
add constraint payments_amount_positive_check
check (amount > 0);

drop trigger if exists invoices_set_updated_at on public.invoices;

create trigger invoices_set_updated_at
before update on public.invoices
for each row
execute function public.set_updated_at();

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.invoice_activities enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Users can view their own invoices" on public.invoices;
create policy "Users can view their own invoices"
on public.invoices for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own invoices" on public.invoices;
create policy "Users can create their own invoices"
on public.invoices for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own invoices" on public.invoices;
create policy "Users can update their own invoices"
on public.invoices for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own invoices" on public.invoices;
create policy "Users can delete their own invoices"
on public.invoices for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their own invoice items" on public.invoice_items;
create policy "Users can view their own invoice items"
on public.invoice_items for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own invoice items" on public.invoice_items;
create policy "Users can create their own invoice items"
on public.invoice_items for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own invoice items" on public.invoice_items;
create policy "Users can update their own invoice items"
on public.invoice_items for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own invoice items" on public.invoice_items;
create policy "Users can delete their own invoice items"
on public.invoice_items for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their own invoice activities" on public.invoice_activities;
create policy "Users can view their own invoice activities"
on public.invoice_activities for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own invoice activities" on public.invoice_activities;
create policy "Users can create their own invoice activities"
on public.invoice_activities for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can view their own payments" on public.payments;
create policy "Users can view their own payments"
on public.payments for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own payments" on public.payments;
create policy "Users can create their own payments"
on public.payments for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own payments" on public.payments;
create policy "Users can update their own payments"
on public.payments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  company_name text,
  contact_name text,
  email text,
  phone text,
  address text,
  website text,
  tax_id text,
  invoice_footer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'free',
  paystack_customer_code text,
  paystack_subscription_code text,
  paystack_email_token text,
  paystack_plan_code text,
  paystack_authorization_code text,
  last_payment_reference text,
  current_period_end timestamptz,
  next_payment_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

alter table public.subscriptions
add column if not exists paystack_customer_code text,
add column if not exists paystack_subscription_code text,
add column if not exists paystack_email_token text,
add column if not exists paystack_plan_code text,
add column if not exists paystack_authorization_code text,
add column if not exists last_payment_reference text,
add column if not exists current_period_end timestamptz,
add column if not exists next_payment_date timestamptz;

drop index if exists subscriptions_flutterwave_customer_id_idx;
drop index if exists subscriptions_flutterwave_tx_ref_idx;
drop index if exists subscriptions_flutterwave_transaction_id_idx;

alter table public.subscriptions
drop column if exists flutterwave_customer_id,
drop column if exists flutterwave_transaction_id,
drop column if exists flutterwave_tx_ref,
drop column if exists flutterwave_flw_ref,
drop column if exists flutterwave_payment_type,
drop column if exists flutterwave_payment_plan;

alter table public.subscriptions
drop constraint if exists subscriptions_plan_check;

alter table public.subscriptions
drop constraint if exists subscriptions_status_check;

update public.subscriptions
set status = case
  when status = 'past_due' then 'attention'
  when status = 'canceled' then 'cancelled'
  else status
end;

create index if not exists subscriptions_paystack_customer_code_idx on public.subscriptions(paystack_customer_code);
create index if not exists subscriptions_paystack_subscription_code_idx on public.subscriptions(paystack_subscription_code);

alter table public.subscriptions
add constraint subscriptions_plan_check
check (plan in ('free', 'monthly', 'yearly'));

alter table public.subscriptions
add constraint subscriptions_status_check
check (status in ('free', 'active', 'non-renewing', 'attention', 'completed', 'cancelled'));

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

create or replace function public.create_default_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'free')
  on conflict (user_id) do nothing;

  insert into public.profiles (user_id, email, contact_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_subscription on auth.users;

create trigger on_auth_user_created_subscription
after insert on auth.users
for each row
execute function public.create_default_subscription();

alter table public.subscriptions enable row level security;

drop policy if exists "Users can view their own subscription" on public.subscriptions;
create policy "Users can view their own subscription"
on public.subscriptions for select
using (auth.uid() = user_id);
