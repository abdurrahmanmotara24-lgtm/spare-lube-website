create table if not exists public.page_content (
  id text primary key,
  eyebrow text not null default '',
  heading text not null default '',
  subheading text not null default '',
  body_paragraph_1 text,
  body_paragraph_2 text,
  body_paragraph_3 text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint page_content_id_check check (id in ('home', 'about', 'contact', 'operating_hours'))
);

insert into public.page_content (
  id,
  eyebrow,
  heading,
  subheading,
  body_paragraph_1,
  body_paragraph_2,
  body_paragraph_3
)
values
  (
    'about',
    'ABOUT SPARELUBE',
    'Reliable Lubricant Supply Since 2010',
    '',
    'SpareLube Auto Lubricant Distributors has been operating since 2010, supplying high-quality automotive lubricants to registered dealers and distributors. With extensive experience in the retail automotive sector, we understand the demands of the industry and deliver solutions that meet them.',
    'We are a service-oriented supplier committed to reliability, efficiency, and excellence. Our strong distribution network, broad product range, and focus on customer satisfaction position us as a preferred distributor for all automotive lubricant requirements.',
    'At SpareLube, we take pride in our customer service. Every client''s needs are carefully assessed to provide tailored solutions. From the moment an order is placed through to final delivery, we ensure a smooth, dependable experience that meets and exceeds expectations.'
  ),
  (
    'contact',
    'Contact Us',
    'Speak With Our Team',
    'Reach out directly to our sales team for product support, pricing, and order assistance.',
    null,
    null,
    null
  ),
  (
    'operating_hours',
    'Operating Hours',
    'Business Schedule',
    'Visit or contact us during trading hours below. For urgent order requests, WhatsApp is the fastest channel.',
    null,
    null,
    null
  ),
  (
    'home',
    'Home',
    'Spare Lube',
    '',
    null,
    null,
    null
  )
on conflict (id) do nothing;

alter table public.page_content enable row level security;

create policy "Allow public read page content"
on public.page_content
for select
using (true);

create policy "Allow authenticated write page content"
on public.page_content
for all
to authenticated
using (true)
with check (true);

create trigger update_page_content_updated_at
before update on public.page_content
for each row
execute function public.update_updated_at_column();

create table if not exists public.contact_team (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  phone text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.contact_team (name, title, phone, sort_order)
values
  ('Mazhar', 'Sales Manager', '073 170 9975', 1),
  ('Shahed', 'Sales Rep', '068 556 6344', 2),
  ('Shiraz', 'Sales Rep', '084 068 0981', 3)
on conflict do nothing;

create index if not exists idx_contact_team_sort on public.contact_team(sort_order, created_at);

alter table public.contact_team enable row level security;

create policy "Allow public read contact team"
on public.contact_team
for select
using (true);

create policy "Allow authenticated write contact team"
on public.contact_team
for all
to authenticated
using (true)
with check (true);

create trigger update_contact_team_updated_at
before update on public.contact_team
for each row
execute function public.update_updated_at_column();
