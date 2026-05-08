alter table public.site_settings
add column if not exists show_order_list boolean not null default true;

update public.site_settings
set show_order_list = true
where show_order_list is null;
