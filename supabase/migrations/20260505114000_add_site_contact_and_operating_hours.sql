create table if not exists public.site_contact (
  id text primary key default 'main',
  phone text not null default '+27000000000',
  whatsapp_phone text not null default '27000000000',
  email text,
  address_line_1 text,
  address_line_2 text,
  city text,
  map_url text,
  contact_blurb text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_contact_singleton check (id = 'main')
);

insert into public.site_contact (
  id,
  phone,
  whatsapp_phone,
  email,
  address_line_1,
  city,
  map_url,
  contact_blurb
) values (
  'main',
  '+27000000000',
  '27000000000',
  'sales@sparelube.co.za',
  'Spare Lube Distribution Centre',
  'Johannesburg',
  'https://maps.google.com',
  'Ready to place an order or need product guidance? Reach out and our team will assist.'
)
on conflict (id) do nothing;

alter table public.site_contact enable row level security;

create policy "Allow public read site contact"
on public.site_contact
for select
using (true);

create policy "Allow authenticated write site contact"
on public.site_contact
for all
to authenticated
using (true)
with check (true);

create trigger update_site_contact_updated_at
before update on public.site_contact
for each row
execute function public.update_updated_at_column();

create table if not exists public.operating_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null unique check (day_of_week between 0 and 6),
  label text not null,
  is_open boolean not null default true,
  open_time time,
  close_time time,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint operating_hours_time_check check (
    (is_open = false and open_time is null and close_time is null)
    or (is_open = true and open_time is not null and close_time is not null and open_time < close_time)
  )
);

insert into public.operating_hours (day_of_week, label, is_open, open_time, close_time, notes, sort_order)
values
  (0, 'Sunday', false, null, null, 'Closed', 0),
  (1, 'Monday', true, '08:00', '17:00', null, 1),
  (2, 'Tuesday', true, '08:00', '17:00', null, 2),
  (3, 'Wednesday', true, '08:00', '17:00', null, 3),
  (4, 'Thursday', true, '08:00', '17:00', null, 4),
  (5, 'Friday', true, '08:00', '17:00', null, 5),
  (6, 'Saturday', true, '08:00', '13:00', null, 6)
on conflict (day_of_week) do nothing;

create index if not exists idx_operating_hours_sort on public.operating_hours(sort_order, day_of_week);

alter table public.operating_hours enable row level security;

create policy "Allow public read operating hours"
on public.operating_hours
for select
using (true);

create policy "Allow authenticated write operating hours"
on public.operating_hours
for all
to authenticated
using (true)
with check (true);

create trigger update_operating_hours_updated_at
before update on public.operating_hours
for each row
execute function public.update_updated_at_column();
