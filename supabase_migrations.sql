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
-- MIGRACION: campo semana en devocionales
-- ============================================================
alter table public.devocionales
  add column if not exists semana text not null default '';


-- ============================================================
-- MIGRACION (2026-07): roles nuevos en RLS
-- ============================================================
-- La app migro a los roles pastor_general, plan_de_vida,
-- pastor_supervisor y pastor_red, pero las politicas RLS solo
-- conocian 'admin' y 'pastor'. Resultado: un usuario con rol
-- pastor_general (u otro rol nuevo) ve el panel de admin pero
-- el INSERT en devocionales es rechazado por RLS y no puede
-- publicar.

-- 1) Ampliar el check constraint de perfiles.rol para aceptar
--    los roles nuevos (el original solo permitia miembro, lider,
--    admin y pastor).
alter table public.perfiles
  drop constraint if exists perfiles_rol_check;
alter table public.perfiles
  add constraint perfiles_rol_check check (rol in (
    'miembro', 'lider', 'admin', 'pastor',
    'pastor_general', 'plan_de_vida', 'pastor_supervisor', 'pastor_red'
  ));

-- 2) Publicar/editar devocionales: solo roles con acceso total
--    (mismo criterio que la UI: el menu "Publicar devocional"
--    solo aparece para estos roles).
drop policy if exists "devocionales_insert" on public.devocionales;
create policy "devocionales_insert" on public.devocionales for insert
  with check (public.get_my_role() in (
    'admin', 'pastor', 'pastor_general', 'plan_de_vida'
  ));

drop policy if exists "devocionales_update" on public.devocionales;
create policy "devocionales_update" on public.devocionales for update
  using (public.get_my_role() in (
    'admin', 'pastor', 'pastor_general', 'plan_de_vida'
  ));

-- 3) Ver perfiles de otros: todos los roles pastorales lo
--    necesitan (resumen, reportes, directorio).
drop policy if exists "perfiles_select" on public.perfiles;
create policy "perfiles_select" on public.perfiles for select
  using (
    auth.uid() = id
    or public.get_my_role() in (
      'admin', 'pastor', 'pastor_general', 'plan_de_vida',
      'pastor_supervisor', 'pastor_red'
    )
  );

-- 4) Editar perfiles de otros (panel Usuarios): solo acceso total.
drop policy if exists "perfiles_update_admin" on public.perfiles;
create policy "perfiles_update_admin" on public.perfiles
  for update
  using (public.get_my_role() in ('admin', 'pastor', 'pastor_general', 'plan_de_vida'))
  with check (public.get_my_role() in ('admin', 'pastor', 'pastor_general', 'plan_de_vida'));

-- 5) Ver reportes de otros: todos los roles pastorales + lider.
--    (El filtro "solo mi red" de pastor_red lo aplica la app.)
drop policy if exists "reportes_select_own" on public.reportes;
create policy "reportes_select_own" on public.reportes for select
  using (
    auth.uid() = user_id
    or public.get_my_role() in (
      'admin', 'pastor', 'lider', 'pastor_general', 'plan_de_vida',
      'pastor_supervisor', 'pastor_red'
    )
  );

-- ============================================================
-- MIGRACION (2026-07): un reporte por TIPO por devocional
-- ============================================================
-- El schema original tiene unique(devocional_id, user_id): un
-- solo reporte por persona por devocional. Pero la app ahora
-- permite hasta 3 reportes (familiar, grupal, empresarial).
-- Con la restriccion vieja, el segundo reporte de un usuario
-- falla con "duplicate key value violates unique constraint".
alter table public.reportes
  drop constraint if exists reportes_devocional_id_user_id_key;
alter table public.reportes
  drop constraint if exists reportes_devocional_user_tipo_key;
alter table public.reportes
  add constraint reportes_devocional_user_tipo_key
  unique (devocional_id, user_id, tipo);

-- Asegurar que la politica de insert de reportes exista
-- (por si se borro al reorganizar politicas en el dashboard).
drop policy if exists "reportes_insert" on public.reportes;
create policy "reportes_insert" on public.reportes for insert
  with check (auth.uid() = user_id);

-- Permitir que cada quien corrija su propio reporte
-- (la app tiene boton "Corregir reporte").
drop policy if exists "reportes_update_own" on public.reportes;
create policy "reportes_update_own" on public.reportes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Fin
-- ============================================================
