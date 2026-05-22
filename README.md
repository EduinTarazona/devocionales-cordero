# Devocionales Cordero — Guia de instalacion

## Requisitos previos
- Node.js 18+ instalado en tu computadora
- Cuenta en GitHub (ya la tienes)
- Cuenta en Supabase (supabase.com) — gratis
- Cuenta en Vercel (vercel.com) — gratis

---

## Paso 1 — Configurar Supabase

1. Ve a https://supabase.com y crea un proyecto llamado `devocionales-cordero`
2. Ve a **SQL Editor** → **New query**
3. Copia y pega todo el contenido del archivo `supabase_schema.sql` y ejecutalo
4. Ve a **Authentication** → **Providers** → activa **Google**
5. Copia la **Callback URL** que te muestra Supabase

## Paso 2 — Configurar Login con Google

1. Ve a https://console.cloud.google.com
2. Crea un nuevo proyecto
3. Ve a **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Tipo de aplicacion: **Web application**
5. En **Authorized redirect URIs** pega la Callback URL de Supabase
6. Copia el **Client ID** y **Client Secret**
7. Pegalos en Supabase → Authentication → Providers → Google

## Paso 3 — Variables de entorno

1. Copia `.env.example` como `.env.local`
2. Rellena con tus datos de Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL` → Settings → API → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Settings → API → anon public

## Paso 4 — Subir a GitHub

```bash
git init
git add .
git commit -m "primer commit"
git remote add origin https://github.com/TU_USUARIO/devocionales-cordero.git
git push -u origin main
```

## Paso 5 — Desplegar en Vercel

1. Ve a https://vercel.com → **New Project**
2. Importa el repositorio de GitHub
3. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click en **Deploy** — listo en 2 minutos

## Paso 6 — Hacerte pastor/admin

1. Entra a la app con tu Gmail por primera vez
2. Ve a Supabase → **Table Editor** → **perfiles**
3. Encuentra tu fila y cambia `rol` de `miembro` a `pastor`
4. Recarga la app — ahora veras el panel administrativo

---

## Estructura del proyecto

```
src/
  app/
    page.tsx              — redirige segun rol
    login/page.tsx        — pantalla de login con Google
    devocional/page.tsx   — pantalla del miembro
    admin/page.tsx        — panel del pastor/admin
    auth/callback/        — callback de Google OAuth
  components/
    miembro/
      DevocionalView.tsx  — vista del devocional
      ReporteModal.tsx    — modal para reportar
    admin/
      AdminDashboard.tsx  — panel principal
      NuevoDevocionalForm.tsx — publicar devocional
      ReportesLista.tsx   — ver todos los reportes
  lib/supabase/
    client.ts             — cliente para el navegador
    server.ts             — cliente para el servidor
middleware.ts             — proteccion de rutas
supabase_schema.sql       — base de datos completa
```

## Prueba local

```bash
npm install
npm run dev
# Abre http://localhost:3000
```
