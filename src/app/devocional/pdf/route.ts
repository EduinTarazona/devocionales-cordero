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

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escHtml(d.titulo)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #F7F2EA;
      color: #1a1a1a;
      padding: 40px 24px;
    }
    .page { max-width: 680px; margin: 0 auto; }

    /* TOOLBAR */
    .toolbar {
      display: flex; gap: 10px; justify-content: flex-end;
      margin-bottom: 32px;
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

    /* HEADER */
    .header {
      display: flex; justify-content: space-between; align-items: flex-end;
      border-bottom: 2px solid #3B3B8E; padding-bottom: 14px; margin-bottom: 24px;
    }
    .logo { line-height: 1.1; }
    .logo .casas { font-size: 20px; font-weight: 800; color: #3B3B8E; }
    .logo .de { font-size: 9px; color: #888; letter-spacing: 1px; text-transform: uppercase; display: block; }
    .logo .vida { font-size: 24px; font-weight: 900; color: #F7941D; letter-spacing: 3px; display: block; }
    .header-right { text-align: right; }
    .semana { font-size: 12px; font-weight: 700; color: #333; }
    .tipo-label { font-size: 13px; font-weight: 700; color: #F7941D; font-style: italic; }

    /* SERIE */
    .serie { font-size: 11px; font-weight: 600; color: #888; text-align: center; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* TÍTULO */
    .titulo-box {
      border: 2px solid #3B3B8E; border-radius: 12px;
      padding: 14px 20px; text-align: center; margin-bottom: 24px;
      background: #fff;
    }
    h1 {
      font-size: 26px; font-weight: 800; line-height: 1.2;
      color: #3B3B8E;
    }

    /* SECCIÓN TÍTULO */
    .seccion-titulo {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 14px; margin-top: 4px;
    }
    .seccion-titulo h2 {
      font-size: 17px; font-weight: 800; color: #3B3B8E;
    }
    .seccion-emoji { font-size: 18px; }

    /* VERSÍCULO */
    blockquote {
      margin: 0 0 16px;
      padding: 0 0 0 18px;
      border-left: 3px solid rgba(59,59,142,0.4);
      position: relative;
    }
    .quote-mark {
      font-family: 'Lora', Georgia, serif;
      font-size: 72px; line-height: 0.8;
      color: rgba(59,59,142,0.10);
      position: absolute; top: -4px; left: -8px;
      pointer-events: none;
    }
    blockquote p {
      font-family: 'Lora', Georgia, serif;
      font-size: 16px; font-weight: 700; line-height: 1.8;
      color: #222; position: relative; text-align: center;
    }
    blockquote footer {
      font-family: 'Inter', sans-serif;
      font-size: 12px; font-weight: 700;
      color: #3B3B8E; margin-top: 10px; letter-spacing: 0.5px; text-align: center;
    }

    /* INTRODUCCIÓN */
    .introduccion {
      font-family: 'Lora', Georgia, serif;
      font-size: 14px; line-height: 1.9;
      color: #444; margin-bottom: 20px;
      white-space: pre-wrap;
    }

    /* DIVISOR */
    .divider {
      display: flex; align-items: center; gap: 12px;
      margin: 20px 0;
    }
    .divider-line { flex: 1; height: 1px; background: #ccc; }
    .divider-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(59,59,142,0.35); }

    /* CONTENIDO CON IMAGEN */
    .contenido-wrap { margin-bottom: 20px; overflow: hidden; }
    .contenido-img {
      float: right; margin-left: 16px; margin-bottom: 8px;
      width: 190px; height: 190px; object-fit: cover;
      border-radius: 12px;
    }
    .contenido p {
      font-family: 'Lora', Georgia, serif;
      font-size: 14px; line-height: 1.9;
      color: #222; text-align: justify;
      margin-bottom: 8px;
    }
    .clearfix::after { content: ''; display: table; clear: both; }

    /* INTERCAMBIEMOS IDEAS */
    .ideas-titulo {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 10px;
    }
    .ideas-titulo h3 {
      font-size: 15px; font-weight: 800; color: #F7941D;
    }
    .ideas {
      font-family: 'Lora', Georgia, serif;
      font-size: 14px; line-height: 1.9;
      color: #333; white-space: pre-wrap; margin-bottom: 20px;
    }

    /* ORACIÓN */
    .oracion-divider {
      display: flex; align-items: center; gap: 12px; margin: 20px 0;
    }
    .oracion-divider-line { flex: 1; height: 1px; background: #ccc; }
    .oracion-icon { font-size: 16px; }
    .oracion {
      font-family: 'Lora', Georgia, serif;
      font-size: 14px; line-height: 1.95;
      color: #444; font-style: italic;
      white-space: pre-wrap; margin-bottom: 20px;
    }

    /* CIERRE */
    .cierre {
      text-align: center; font-weight: 800; font-size: 15px;
      color: #F7941D; margin-top: 16px;
    }

    @media print {
      .toolbar { display: none !important; }
      body { padding: 0; background: #F7F2EA; }
      @page { size: A4; margin: 18mm; background: #F7F2EA; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn-print" onclick="window.print()">Imprimir / Guardar PDF</button>
    <button class="btn-close" onclick="window.close()">Cerrar</button>
  </div>

  <div class="page">
    <!-- HEADER -->
    <div class="header">
      <div class="logo">
        <span class="casas">Casas</span>
        <span class="de">de</span>
        <span class="vida">VIDA</span>
      </div>
      <div class="header-right">
        ${d.semana ? `<div class="semana">Semana ${escHtml(d.semana)}</div>` : ''}
        <div class="tipo-label">${escHtml(tipo)}</div>
      </div>
    </div>

    <!-- SERIE + TÍTULO -->
    ${d.serie ? `<p class="serie">Serie: ${escHtml(d.serie)}</p>` : ''}
    <div class="titulo-box">
      <h1>${escHtml(d.titulo)}</h1>
    </div>

    <!-- A) LEAMOS JUNTOS -->
    <div class="seccion-titulo">
      <span class="seccion-emoji">📖</span>
      <h2>A) Leamos Juntos</h2>
    </div>

    ${d.pasaje ? `
    <blockquote>
      <span class="quote-mark">&ldquo;</span>
      <p>${escHtml(d.pasaje)}</p>
      ${d.referencia ? `<footer>${escHtml(d.referencia)}</footer>` : ''}
    </blockquote>
    ` : ''}

    ${d.introduccion ? `<p class="introduccion">${escHtml(d.introduccion)}</p>` : ''}

    <!-- DIVISOR -->
    <div class="divider">
      <div class="divider-line"></div>
      <div class="divider-dot"></div>
      <div class="divider-line"></div>
    </div>

    <!-- B) APRENDEMOS EN FAMILIA -->
    <div class="seccion-titulo">
      <span class="seccion-emoji">👨‍👩‍👧‍👦</span>
      <h2>B) Aprendemos en Familia la verdad de Dios</h2>
    </div>

    ${d.contenido ? `
    <div class="contenido-wrap clearfix">
      ${d.imagen_url ? `<img class="contenido-img" src="${d.imagen_url}" alt="Ilustración" />` : ''}
      <div class="contenido">
        ${d.contenido.split('\n').filter((l: string) => l.trim()).map((l: string) => `<p>${escHtml(l)}</p>`).join('')}
      </div>
    </div>
    ` : ''}

    <!-- INTERCAMBIEMOS IDEAS -->
    ${d.intercambiemos_ideas ? `
    <div class="ideas-titulo">
      <span class="seccion-emoji">💡</span>
      <h3>Intercambiemos ideas:</h3>
    </div>
    <div class="ideas">${escHtml(d.intercambiemos_ideas)}</div>
    ` : ''}

    <!-- DIVISOR -->
    <div class="divider">
      <div class="divider-line"></div>
      <div class="divider-dot"></div>
      <div class="divider-line"></div>
    </div>

    <!-- C) ORACIÓN -->
    <div class="seccion-titulo">
      <span class="seccion-emoji">🙏</span>
      <h2>C) Tomamos tiempo para agradecer y orar</h2>
    </div>

    ${d.oracion ? `<div class="oracion">${escHtml(d.oracion)}</div>` : ''}

    <!-- CIERRE -->
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
