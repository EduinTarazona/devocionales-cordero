-- ============================================================
--  DEVOCIONALES CORDERO — Script de base de datos
--  Ejecutar en: Supabase → SQL Editor → New query
-- ============================================================

-- 1. PERFILES de usuario (extiende auth.users de Supabase)
create table public.perfiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  nombre      text,
  email       text,
  rol         text not null default 'miembro' check (rol in ('miembro', 'lider', 'admin', 'pastor')),
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Crear perfil automaticamente cuando alguien se registra con Google
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, nombre, email, rol)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'miembro'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. DEVOCIONALES
create table public.devocionales (
  id          uuid primary key default gen_random_uuid(),
  semana      text not null,
  titulo      text not null,
  tipo        text not null default 'familiar' check (tipo in ('familiar', 'grupal', 'empresarial')),
  pasaje      text,
  referencia  text,
  contenido   text not null,
  oracion     text,
  activo      boolean not null default false,
  created_by  uuid references public.perfiles(id),
  created_at  timestamptz not null default now()
);


-- 3. REPORTES
create table public.reportes (
  id                    uuid primary key default gen_random_uuid(),
  devocional_id         uuid references public.devocionales(id) on delete cascade not null,
  user_id               uuid references public.perfiles(id) on delete cascade not null,
  personas_participaron integer not null default 1,
  hubo_ofrenda          boolean not null default false,
  monto_ofrenda         numeric(10,2),
  nota                  text,
  created_at            timestamptz not null default now(),
  unique(devocional_id, user_id)  -- un reporte por persona por devocional
);


-- ============================================================
--  SEGURIDAD — Row Level Security (RLS)
-- ============================================================

alter table public.perfiles    enable row level security;
alter table public.devocionales enable row level security;
alter table public.reportes     enable row level security;

-- Perfiles: cada quien ve su propio perfil; admins ven todos
create policy "perfiles_select" on public.perfiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('admin', 'pastor')
    )
  );

create policy "perfiles_update_own" on public.perfiles for update
  using (auth.uid() = id);

-- Devocionales: todos los autenticados pueden leer; solo admin/pastor escriben
create policy "devocionales_select" on public.devocionales for select
  to authenticated using (true);

create policy "devocionales_insert" on public.devocionales for insert
  with check (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('admin', 'pastor')
    )
  );

create policy "devocionales_update" on public.devocionales for update
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('admin', 'pastor')
    )
  );

-- Reportes: cada quien inserta y ve el suyo; admins ven todos
create policy "reportes_insert" on public.reportes for insert
  with check (auth.uid() = user_id);

create policy "reportes_select_own" on public.reportes for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('admin', 'pastor', 'lider')
    )
  );


-- ============================================================
--  PRIMER ADMIN — reemplaza el email con el tuyo
-- ============================================================
-- Ejecuta esto DESPUES de haber ingresado a la app por primera vez con tu Gmail:

-- update public.perfiles set rol = 'pastor' where email = 'TU_EMAIL@gmail.com';
