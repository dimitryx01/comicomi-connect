
-- 1) Tabla de tipos de cocina normalizada
create table if not exists public.cuisines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cuisines enable row level security;

-- Política: cualquiera puede leer
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'cuisines' and policyname = 'Cuisines are public'
  ) then
    create policy "Cuisines are public"
      on public.cuisines
      for select
      using (true);
  end if;
end $$;

-- Trigger de updated_at (usa función ya existente en el proyecto)
drop trigger if exists cuisines_set_timestamp on public.cuisines;
create trigger cuisines_set_timestamp
  before update on public.cuisines
  for each row
  execute procedure public.update_updated_at_column();

-- Seed de tipos de cocina (idempotente)
insert into public.cuisines (slug, name, is_active, sort_order)
values
  ('italiana','Italiana', true, 1),
  ('mexicana','Mexicana', true, 2),
  ('asiatica','Asiática', true, 3),
  ('mediterranea','Mediterránea', true, 4),
  ('colombiana','Colombiana', true, 5),
  ('francesa','Francesa', true, 6),
  ('japonesa','Japonesa', true, 7),
  ('india','India', true, 8),
  ('tailandesa','Tailandesa', true, 9),
  ('peruana','Peruana', true, 10),
  ('argentina','Argentina', true, 11),
  ('espanola','Española', true, 12),
  ('griega','Griega', true, 13),
  ('libanesa','Libanesa', true, 14),
  ('coreana','Coreana', true, 15),
  ('brasilena','Brasileña', true, 16)
on conflict (slug) do nothing;

-- 2) Tabla de unidades de medida normalizada
create table if not exists public.measurement_units (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,         -- ej: 'ml', 'g', 'unidad', 'cdita', 'cda', 'taza'
  name text not null,                -- texto de presentación
  category text not null default 'unit', -- 'mass' | 'volume' | 'count' | 'length' | 'temperature' | 'other'
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.measurement_units enable row level security;

-- Política: cualquiera puede leer
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'measurement_units' and policyname = 'Measurement units are public'
  ) then
    create policy "Measurement units are public"
      on public.measurement_units
      for select
      using (true);
  end if;
end $$;

-- Trigger de updated_at
drop trigger if exists measurement_units_set_timestamp on public.measurement_units;
create trigger measurement_units_set_timestamp
  before update on public.measurement_units
  for each row
  execute procedure public.update_updated_at_column();

-- Seed de unidades (idempotente)
insert into public.measurement_units (code, name, category, is_active, sort_order)
values
  ('unidad', 'Unidad', 'count', true, 1),
  ('g', 'Gramo (g)', 'mass', true, 2),
  ('kg', 'Kilogramo (kg)', 'mass', true, 3),
  ('ml', 'Mililitro (ml)', 'volume', true, 4),
  ('l', 'Litro (l)', 'volume', true, 5),
  ('cdita', 'Cucharadita (cdita)', 'volume', true, 6),
  ('cda', 'Cucharada (cda)', 'volume', true, 7),
  ('taza', 'Taza', 'volume', true, 8),
  ('pizca', 'Pizca', 'other', true, 9)
on conflict (code) do nothing;
