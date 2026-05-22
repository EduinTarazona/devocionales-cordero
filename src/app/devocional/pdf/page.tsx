import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DevocionalPDFPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: d } = await supabase
    .from('devocionales')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!d) redirect('/devocional')

  const tipo = d.tipo === 'familiar' ? 'Devocional Familiar'
    : d.tipo === 'grupal' ? 'Devocional Grupal'
    : 'Devocional Empresarial'

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{d.titulo}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          body {
            font-family: 'Inter', Arial, sans-serif;
            background: #F7F2EA;
            color: #1a1a1a;
            min-height: 100vh;
            padding: 40px;
          }

          .page {
            max-width: 750px;
            margin: 0 auto;
            background: #F7F2EA;
            position: relative;
          }

          /* HEADER */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 28px;
            padding-bottom: 16px;
            border-bottom: 2px solid #0E7773;
          }

          .logo-casas {
            display: flex;
            flex-direction: column;
            line-height: 1;
          }
          .logo-casas .casas {
            font-size: 22px;
            font-weight: 800;
            color: #0E7773;
            letter-spacing: -0.5px;
          }
          .logo-casas .de {
            font-size: 10px;
            color: #666;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .logo-casas .vida {
            font-size: 26px;
            font-weight: 900;
            color: #0E7773;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          .header-right {
            text-align: right;
          }
          .semana-label {
            font-size: 13px;
            font-weight: 700;
            color: #1a1a1a;
          }
          .tipo-label {
            font-size: 15px;
            font-weight: 800;
            color: #0E7773;
            text-decoration: underline;
            font-style: italic;
          }

          /* TITULO */
          .titulo-section {
            text-align: center;
            margin-bottom: 20px;
          }
          .titulo {
            font-size: 28px;
            font-weight: 800;
            color: #1a1a1a;
            line-height: 1.2;
            margin-bottom: 6px;
          }
          .referencia {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a1a;
          }

          /* PASAJE */
          .pasaje-box {
            text-align: center;
            margin: 18px 0 24px;
            padding: 0 20px;
          }
          .pasaje-text {
            font-size: 15px;
            font-style: italic;
            color: #1a1a1a;
            line-height: 1.7;
            font-weight: 500;
          }

          /* CONTENIDO */
          .contenido {
            font-size: 13.5px;
            line-height: 1.85;
            color: #1a1a1a;
            text-align: justify;
            white-space: pre-wrap;
            margin-bottom: 24px;
          }

          /* ORACION */
          .oracion-section {
            margin-top: 24px;
          }
          .oracion-title {
            font-size: 15px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .oracion-text {
            font-size: 13.5px;
            line-height: 1.85;
            color: #1a1a1a;
            white-space: pre-wrap;
          }

          /* DECORACION */
          .corner-deco {
            position: fixed;
            bottom: 0;
            right: 0;
            width: 200px;
            opacity: 0.06;
            pointer-events: none;
          }

          @media print {
            body { padding: 20px; background: #F7F2EA; }
            .no-print { display: none !important; }
            @page { size: A4; margin: 15mm; background: #F7F2EA; }
          }
        `}</style>
      </head>
      <body>
        {/* Botón de imprimir */}
        <div className="no-print" style={{
          position: 'fixed', top: 16, right: 16, zIndex: 99,
          display: 'flex', gap: 8
        }}>
          <button
            onClick={() => window.print()}
            style={{
              background: '#0E7773', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: 8, fontWeight: 700,
              fontSize: 14, cursor: 'pointer'
            }}
          >
            Descargar / Imprimir PDF
          </button>
          <button
            onClick={() => window.close()}
            style={{
              background: '#e5e7eb', color: '#374151', border: 'none',
              padding: '10px 16px', borderRadius: 8, fontWeight: 600,
              fontSize: 14, cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>

        <div className="page">
          {/* HEADER */}
          <div className="header">
            <div className="logo-casas">
              <span className="casas">Casas</span>
              <span className="de">de</span>
              <span className="vida">VIDA</span>
            </div>
            <div className="header-right">
              {d.semana && (
                <div className="semana-label">Semana {d.semana}</div>
              )}
              <div className="tipo-label">{tipo}</div>
            </div>
          </div>

          {/* TITULO */}
          <div className="titulo-section">
            <h1 className="titulo">{d.titulo}</h1>
            {d.referencia && (
              <div className="referencia">Cita clave {d.referencia}</div>
            )}
          </div>

          {/* PASAJE */}
          {d.pasaje && (
            <div className="pasaje-box">
              <p className="pasaje-text">"{d.pasaje}"</p>
            </div>
          )}

          {/* CONTENIDO */}
          {d.contenido && (
            <div className="contenido">{d.contenido}</div>
          )}

          {/* ORACION */}
          {d.oracion && (
            <div className="oracion-section">
              <div className="oracion-title">Oremos juntos</div>
              <div className="oracion-text">{d.oracion}</div>
            </div>
          )}
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          // Auto-print si viene con ?print=1
          if (new URLSearchParams(window.location.search).get('print') === '1') {
            window.onload = () => setTimeout(() => window.print(), 500)
          }
        `}} />
      </body>
    </html>
  )
}
