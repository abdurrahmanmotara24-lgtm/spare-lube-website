create table if not exists public.pack_size_rules (
  id uuid primary key default gen_random_uuid(),
  brand_id text not null references public.brands(id) on delete cascade,
  size_id uuid not null references public.sizes(id) on delete cascade,
  units_per_pack integer not null check (units_per_pack > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, size_id)
);

create index if not exists idx_pack_size_rules_brand on public.pack_size_rules(brand_id);
create index if not exists idx_pack_size_rules_size on public.pack_size_rules(size_id);

alter table public.pack_size_rules enable row level security;

create policy "Allow public read pack size rules"
on public.pack_size_rules
for select
using (true);

create policy "Allow authenticated write pack size rules"
on public.pack_size_rules
for all
to authenticated
using (true)
with check (true);

create trigger update_pack_size_rules_updated_at
before update on public.pack_size_rules
for each row
execute function public.update_updated_at_column();
