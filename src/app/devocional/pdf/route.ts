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
      border-bottom: 2px solid #3B3B8E; padding-bottom: 14px; margin-bottom: 28px;
    }
    .logo { line-height: 1.1; }
    .logo .casas { font-size: 20px; font-weight: 800; color: #3B3B8E; }
    .logo .de { font-size: 9px; color: #888; letter-spacing: 1px; text-transform: uppercase; display: block; }
    .logo .vida { font-size: 24px; font-weight: 900; color: #F7941D; letter-spacing: 3px; display: block; }
    .header-right { text-align: right; }
    .semana { font-size: 12px; font-weight: 700; color: #333; }
    .tipo-label { font-size: 13px; font-weight: 700; color: #F7941D; font-style: italic; }

    /* TÍTULO */
    h1 {
      font-size: 30px; font-weight: 800; line-height: 1.2;
      color: #111; margin-bottom: 8px; text-align: center;
    }
    .referencia-clave {
      text-align: center; font-size: 13px; font-weight: 600;
      color: #444; margin-bottom: 20px;
    }

    /* VERSÍCULO */
    blockquote {
      margin: 20px 0 28px;
      padding: 0 0 0 18px;
      border-left: 3px solid #3B3B8E;
      position: relative;
    }
    .quote-mark {
      font-family: 'Lora', Georgia, serif;
      font-size: 72px; line-height: 0.8;
      color: rgba(59,59,142,0.12);
      position: absolute; top: -4px; left: -8px;
      pointer-events: none; select: none;
    }
    blockquote p {
      font-family: 'Lora', Georgia, serif;
      font-size: 16px; font-style: italic; line-height: 1.8;
      color: #222; position: relative;
    }
    blockquote footer {
      font-family: 'Inter', sans-serif;
      font-size: 12px; font-weight: 700;
      color: #3B3B8E; margin-top: 10px; letter-spacing: 0.5px;
    }

    /* DIVISOR */
    .divider {
      display: flex; align-items: center; gap: 12px;
      margin: 24px 0;
    }
    .divider-line { flex: 1; height: 1px; background: #ccc; }
    .divider-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(59,59,142,0.35); }

    /* CONTENIDO */
    .contenido {
      font-family: 'Lora', Georgia, serif;
      font-size: 14.5px; line-height: 1.95;
      color: #222; text-align: justify;
      white-space: pre-wrap; margin-bottom: 28px;
    }

    /* ORACIÓN */
    .oracion-divider {
      display: flex; align-items: center; gap: 12px; margin: 24px 0;
    }
    .oracion-divider-line { flex: 1; height: 1px; background: #ccc; }
    .oracion-icon { font-size: 16px; }
    .oracion {
      font-family: 'Lora', Georgia, serif;
      font-size: 14px; line-height: 1.95;
      color: #444; font-style: italic;
      white-space: pre-wrap;
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

    <!-- TÍTULO -->
    <h1>${escHtml(d.titulo)}</h1>
    ${d.referencia ? `<p class="referencia-clave">Cita clave ${escHtml(d.referencia)}</p>` : ''}

    <!-- VERSÍCULO -->
    ${d.pasaje ? `
    <blockquote>
      <span class="quote-mark">&ldquo;</span>
      <p>${escHtml(d.pasaje)}</p>
      ${d.referencia ? `<footer>${escHtml(d.referencia)}</footer>` : ''}
    </blockquote>
    ` : ''}

    <!-- DIVISOR -->
    <div class="divider">
      <div class="divider-line"></div>
      <div class="divider-dot"></div>
      <div class="divider-line"></div>
    </div>

    <!-- CONTENIDO -->
    ${d.contenido ? `<div class="contenido">${escHtml(d.contenido)}</div>` : ''}

    <!-- ORACIÓN -->
    ${d.oracion ? `
    <div class="oracion-divider">
      <div class="oracion-divider-line"></div>
      <span class="oracion-icon">🕊️</span>
      <div class="oracion-divider-line"></div>
    </div>
    <div class="oracion">${escHtml(d.oracion)}</div>
    ` : ''}
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
