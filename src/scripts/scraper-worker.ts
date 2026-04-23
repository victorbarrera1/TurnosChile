import { runScraperLoop } from '../lib/scraper'

// Script para ejecutar el scraper como worker independiente
// Se puede ejecutar con: npm run scraper:run

async function main() {
  console.log('🚀 Iniciando scraper worker...')
  console.log('📍 Presiona Ctrl+C para detener')

  // Ejecutar inmediatamente
  await runScraperLoop()

  // Luego ejecutar cada 5 minutos
  const INTERVAL_MINUTES = 5
  const intervalMs = INTERVAL_MINUTES * 60 * 1000

  setInterval(async () => {
    console.log(`\n[${new Date().toISOString()}] Ejecutando verificación...`)
    await runScraperLoop()
  }, intervalMs)
}

main().catch(console.error)
