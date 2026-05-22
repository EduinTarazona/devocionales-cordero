-- ============================================================
-- DEVOCIONALES CORDERO — Migraciones pendientes
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- Copia y pega TODO este archivo y dale "Run".
-- Es seguro correrlo varias veces (usa drop policy if exists).
-- ============================================================

-- ============================================================
-- PROBLEMA QUE RESUELVE
-- ============================================================
-- La politica RLS original "perfiles_select" hace una subquery
-- a la misma tabla perfiles para chequear si el usuario es
-- admin/pastor. Postgres aplica RLS a esa subquery tambien y
-- en algunos casos devuelve cero filas, haciendo que el server
-- vea perfil = null y trate al usuario como miembro aunque su
-- rol real sea pastor.
--
-- La solucion oficial de Supabase es encapsular el lookup del
-- rol en una funcion SECURITY DEFINER que corra fuera de RLS.
-- ============================================================


-- 1) Funcion helper que obtiene el rol del usuario actual sin
--    pasar por RLS. SECURITY DEFINER ejecuta con privilegios del
--    creador (bypasea RLS dentro de la funcion).
create or replace function public.get_my_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select rol from public.perfiles where id = auth.uid()
$$;

grant execute on function public.get_my_role() to authenticated;


-- 2) Reescribir politica SELECT de perfiles SIN recursion.
drop policy if exists "perfiles_select" on public.perfiles;
create policy "perfiles_select" on public.perfiles for select
  using (
    auth.uid() = id
    or public.get_my_role() in ('admin', 'pastor')
  );


-- 3) Politica UPDATE para admin/pastor (panel de Usuarios).
--    La politica perfiles_update_own existente solo permite
--    update del propio perfil; esta agrega que admin/pastor
--    pueden actualizar a otros.
drop policy if exists "perfiles_update_admin" on public.perfiles;
create policy "perfiles_update_admin" on public.perfiles
  for update
  using (public.get_my_role() in ('admin', 'pastor'))
  with check (public.get_my_role() in ('admin', 'pastor'));


-- 4) Reescribir politicas de devocionales (mismo patron recursivo).
drop policy if exists "devocionales_insert" on public.devocionales;
create policy "devocionales_insert" on public.devocionales for insert
  with check (public.get_my_role() in ('admin', 'pastor'));

drop policy if exists "devocionales_update" on public.devocionales;
create policy "devocionales_update" on public.devocionales for update
  using (public.get_my_role() in ('admin', 'pastor'));


-- 5) Reescribir politica de reportes (mismo patron).
drop policy if exists "reportes_select_own" on public.reportes;
create policy "reportes_select_own" on public.reportes for select
  using (
    auth.uid() = user_id
    or public.get_my_role() in ('admin', 'pastor', 'lider')
  );


-- ============================================================
-- Fin
-- ============================================================
