import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SUPABASE_URL))

  const { data: d } = await supabase
    .from('devocionales')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!d) return NextResponse.redirect('/devocional')

  const tipo = d.tipo === 'familiar' ? 'Devocional Familiar'
    : d.tipo === 'grupal' ? 'Devocional Grupal'
    : 'Devocional Empresarial'

  // Split contenido into paragraphs
  const contenidoParrafos: string[] = []
  if (d.contenido) {
    const lineas = d.contenido.split('\n')
    let actual: string[] = []
    for (const linea of lineas) {
      if (linea.trim()) { actual.push(linea.trim()) }
      else if (actual.length > 0) { contenidoParrafos.push(actual.join(' ')); actual = [] }
    }
    if (actual.length > 0) contenidoParrafos.push(actual.join(' '))
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escHtml(d.titulo)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #fff;
      color: #1a1a1a;
      padding: 32px 28px;
    }
    .page { max-width: 700px; margin: 0 auto; }

    /* ── TOOLBAR ── */
    .toolbar {
      display: flex; gap: 10px; justify-content: flex-end;
      margin-bottom: 28px;
    }
    .btn-print {
      background: linear-gradient(90deg, #3B3B8E, #F7941D); color: #fff; border: none;
      padding: 10px 22px; border-radius: 8px; font-weight: 700;
      font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif;
    }
    .btn-close {
      background: #e5e7eb; color: #374151; border: none;
      padding: 10px 16px; border-radius: 8px; font-weight: 600;
      font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif;
    }

    /* ── HEADER ── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #3B3B8E;
      padding-bottom: 12px;
      margin-bottom: 10px;
    }
    .header-logo-left {
      width: 70px;
      flex-shrink: 0;
    }
    .header-logo-left img {
      width: 70px;
      height: auto;
      object-fit: contain;
    }
    .header-center {
      flex: 1;
      text-align: center;
      padding: 0 12px;
    }
    .header-center .iglesia {
      font-size: 12px;
      font-weight: 900;
      color: #3B3B8E;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      line-height: 1.3;
    }
    .header-center .depto {
      font-size: 10px;
      font-weight: 600;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .header-center .casas {
      font-size: 10px;
      font-weight: 700;
      color: #F7941D;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 1px;
    }
    .header-logo-right {
      width: 56px;
      flex-shrink: 0;
    }

    /* ── META INFO (serie/bosquejo/semana) ── */
    .meta-info {
      display: flex;
      gap: 18px;
      flex-wrap: wrap;
      font-size: 10.5px;
      color: #555;
      font-weight: 600;
      margin-bottom: 10px;
      margin-top: 6px;
      padding-left: 2px;
    }
    .meta-info span { white-space: nowrap; }
    .meta-info .tipo-badge {
      margin-left: auto;
      font-size: 10px;
      font-weight: 700;
      color: #F7941D;
      font-style: italic;
    }

    /* ── TÍTULO ── */
    .titulo-box {
      border: 2px solid #3B3B8E;
      border-radius: 8px;
      padding: 12px 18px;
      text-align: center;
      margin-bottom: 18px;
      background: #fff;
      position: relative;
    }
    .titulo-box::after {
      content: '';
      position: absolute;
      bottom: -2px; left: 10%; right: 10%;
      height: 4px;
      background: #F7941D;
      border-radius: 0 0 4px 4px;
    }
    h1 {
      font-size: 22px;
      font-weight: 900;
      line-height: 1.25;
      color: #3B3B8E;
      font-family: 'Inter', sans-serif;
    }

    /* ── SECCIÓN HEADING ── */
    .seccion-titulo {
      font-size: 15px;
      font-weight: 800;
      color: #3B3B8E;
      margin-bottom: 10px;
      margin-top: 6px;
      font-family: 'Inter', sans-serif;
    }

    /* ── VERSÍCULO ── */
    .versiculo-box {
      text-align: center;
      margin-bottom: 12px;
      padding: 0 10px;
    }
    .versiculo-texto {
      font-family: 'Lora', Georgia, serif;
      font-size: 14.5px;
      font-weight: 700;
      line-height: 1.75;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    .versiculo-ref {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: #3B3B8E;
      letter-spacing: 0.5px;
    }

    /* ── INTRODUCCIÓN ── */
    .introduccion {
      font-family: 'Lora', Georgia, serif;
      font-size: 13.5px;
      line-height: 1.85;
      color: #222 !important;
      margin-bottom: 16px;
      text-align: justify;
      white-space: pre-wrap;
    }
    /* reset link colors globally */
    a { color: inherit !important; text-decoration: none !important; }
    * { color: inherit; }

    /* ── DIVISOR ── */
    .divider {
      display: flex; align-items: center; gap: 10px;
      margin: 14px 0;
    }
    .divider-line { flex: 1; height: 1px; background: #d1d5db; }
    .divider-dot  { width: 5px; height: 5px; border-radius: 50%; background: #3B3B8E; opacity: 0.35; }

    /* ── CONTENIDO (float image) ── */
    .contenido-wrap { margin-bottom: 18px; overflow: hidden; }
    .contenido-img {
      float: right;
      margin-left: 14px;
      margin-bottom: 8px;
      width: 185px;
      height: 185px;
      object-fit: cover;
      border-radius: 10px;
    }
    .contenido-wrap p {
      font-family: 'Lora', Georgia, serif;
      font-size: 13.5px;
      line-height: 1.85;
      color: #222 !important;
      text-align: justify;
      margin-bottom: 7px;
    }
    .clearfix::after { content: ''; display: table; clear: both; }

    /* ── INTERCAMBIEMOS IDEAS ── */
    .ideas-heading {
      font-size: 15px;
      font-weight: 800;
      color: #F7941D;
      margin-bottom: 8px;
      margin-top: 4px;
      font-family: 'Inter', sans-serif;
    }
    .ideas-wrap { overflow: hidden; margin-bottom: 16px; }
    .ideas-img {
      float: right;
      margin-left: 14px;
      margin-bottom: 8px;
      width: 100px;
      height: 100px;
      object-fit: contain;
    }
    .ideas-texto {
      font-family: 'Lora', Georgia, serif;
      font-size: 13.5px;
      line-height: 1.85;
      color: #222 !important;
      white-space: pre-wrap;
    }

    /* ── ORACIÓN ── */
    .oracion-texto {
      font-family: 'Lora', Georgia, serif;
      font-size: 13.5px;
      line-height: 1.9;
      color: #222 !important;
      white-space: pre-wrap;
      margin-bottom: 20px;
    }

    /* ── CIERRE ── */
    .cierre {
      text-align: center;
      font-weight: 900;
      font-size: 15px;
      color: #F7941D;
      margin-top: 18px;
      font-family: 'Inter', sans-serif;
    }

    /* ── PRINT ── */
    @media print {
      .toolbar { display: none !important; }
      body { padding: 0; background: #fff; }
      @page { size: A4; margin: 16mm; background: #fff; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn-print" onclick="window.print()">Imprimir / Guardar PDF</button>
    <button class="btn-close" onclick="window.close()">Cerrar</button>
  </div>

  <div class="page">

    <!-- ══ ENCABEZADO ══ -->
    <div class="header">
      <div class="header-logo-left">
        <img src="/logo-casasvida.png.png" alt="Logo" />
      </div>
      <div class="header-center">
        <div class="iglesia">Centro Cristiano Misión Global<br/>"San Cristóbal"</div>
        <div class="depto">Departamento de Familia</div>
        <div class="casas">Casas de Vida Familiar</div>
      </div>
      <div class="header-logo-right"></div>
    </div>

    <!-- ══ META INFO ══ -->
    <div class="meta-info">
      ${d.serie ? `<span>Serie: ${escHtml(d.serie)}</span>` : ''}
      ${d.semana ? `<span>Semana: ${escHtml(d.semana)}</span>` : ''}
      <span class="tipo-badge">${escHtml(tipo)}</span>
    </div>

    <!-- ══ TÍTULO ══ -->
    <div class="titulo-box">
      <h1>${escHtml(d.titulo)}</h1>
    </div>

    <!-- ══ A) LEAMOS JUNTOS ══ -->
    <div class="seccion-titulo">A) Leamos Juntos:</div>

    ${d.pasaje ? `
    <div class="versiculo-box">
      <div class="versiculo-texto">${escHtml(d.pasaje)}</div>
      ${d.referencia ? `<div class="versiculo-ref">${escHtml(d.referencia)}</div>` : ''}
    </div>
    ` : ''}

    ${d.introduccion ? `<div class="introduccion">${escHtml(d.introduccion)}</div>` : ''}

    <!-- divisor -->
    <div class="divider">
      <div class="divider-line"></div>
      <div class="divider-dot"></div>
      <div class="divider-line"></div>
    </div>

    <!-- ══ B) APRENDEMOS EN FAMILIA ══ -->
    <div class="seccion-titulo">B) Aprendemos en Familia la verdad de Dios:</div>

    ${contenidoParrafos.length > 0 ? `
    <div class="contenido-wrap clearfix">
      ${d.imagen_url ? `<img class="contenido-img" src="${d.imagen_url}" alt="Ilustración" />` : ''}
      ${contenidoParrafos.map(p => `<p>${escHtml(p)}</p>`).join('')}
    </div>
    ` : ''}

    <!-- ══ INTERCAMBIEMOS IDEAS ══ -->
    ${d.intercambiemos_ideas ? `
    <div class="ideas-heading">Intercambiemos ideas:</div>
    <div class="ideas-wrap clearfix">
      <img class="ideas-img" src="/Intercambiemos_ideas.png" alt="" />
      <div class="ideas-texto">${escHtml(d.intercambiemos_ideas)}</div>
    </div>
    ` : ''}

    <!-- divisor -->
    <div class="divider">
      <div class="divider-line"></div>
      <div class="divider-dot"></div>
      <div class="divider-line"></div>
    </div>

    <!-- ══ C) ORACIÓN ══ -->
    <div class="seccion-titulo">C) Tomamos tiempo para agradecer y orar:</div>

    ${d.oracion ? `<div class="oracion-texto">${escHtml(d.oracion)}</div>` : ''}

    <!-- ══ CIERRE ══ -->
    <p class="cierre">¡Yo y mi Casa Serviremos al Señor!</p>

  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function escHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
