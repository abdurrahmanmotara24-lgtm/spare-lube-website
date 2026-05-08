alter table public.site_settings
add column if not exists show_about boolean not null default true,
add column if not exists show_contact boolean not null default true,
add column if not exists show_operating_hours boolean not null default true,
add column if not exists show_weekly_specials boolean not null default true;
