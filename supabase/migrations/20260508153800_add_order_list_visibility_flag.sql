alter table public.site_settings
add column if not exists show_order_list boolean not null default true;
