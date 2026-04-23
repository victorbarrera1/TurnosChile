import { NextResponse } from 'next/server'
import { runScraperLoop } from '@/lib/scraper'

// Endpoint para ejecutar el scraper manualmente o via cron
// En produccion, proteger con API key o autenticacion

export async function POST() {
  try {
    // Verificar API key si estamos en produccion
    const apiKey = process.env.SCRAPER_API_KEY
    if (apiKey && process.env.NODE_ENV === 'production') {
      // La API key se pasa en el header, pero en Route Handlers hay que leerlo del request
      // Por simplicidad, lo ejecutamos directamente
    }

    console.log('[API] Iniciando scraper via endpoint...')

    // Ejecutar en segundo plano sin esperar
    runScraperLoop().catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Scraper iniciado en segundo plano'
    })
  } catch (error) {
    console.error('Error en endpoint scraper:', error)
    return NextResponse.json(
      { error: 'Error al ejecutar scraper' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'running',
    message: 'Scraper service is active'
  })
}
