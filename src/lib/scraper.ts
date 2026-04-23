import puppeteer from 'puppeteer'
import { prisma } from './prisma'
import { TRAMITES_DISPONIBLES, SCRAPER_SELECTORS } from './tramites'
import { sendEmailAlert } from './notifications'

export interface SlotResult {
  disponible: boolean
  fecha?: string
  mensaje?: string
}

async function scrapeRegistroCivil(page: any, tramiteId: string): Promise<SlotResult> {
  try {
    // Navegar a la página de reservas
    await page.goto('https://www.registrocivil.cl/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    // Buscar enlaces de agendamiento
    const selectors = [
      'a[href*="reserva"]',
      'a[href*="agenda"]',
      '.btn-agendar',
      '.slot-disponible'
    ]

    for (const selector of selectors) {
      const element = await page.$(selector)
      if (element) {
        const text = await page.evaluate((el: HTMLElement) => el.textContent, element)
        if (text?.toLowerCase().includes('disponible')) {
          return { disponible: true, mensaje: 'Turno detectado en Registro Civil' }
        }
      }
    }

    // Verificar si hay mensajes de "no hay disponibilidad"
    const noSlotsSelectors = [
      'no hay disponibilidad',
      'sin disponibilidad',
      'agenda cerrada',
      'no hay turnos'
    ]

    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase())

    for (const noSlotText of noSlotsSelectors) {
      if (pageText.includes(noSlotText)) {
        return { disponible: false, mensaje: 'Sin disponibilidad momentánea' }
      }
    }

    return { disponible: false, mensaje: 'No se detectaron turnos disponibles' }
  } catch (error) {
    console.error(`Error scraping Registro Civil:`, error)
    return { disponible: false, mensaje: 'Error en scraping' }
  }
}

async function scrapeGenerico(page: any, url: string, tramiteId: string): Promise<SlotResult> {
  try {
    const config = SCRAPER_SELECTORS[tramiteId] || {
      slotSelector: '.disponible, .available, .slot',
      availableText: 'disponible'
    }

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

    // Buscar elementos que indiquen disponibilidad
    const elements = await page.$$(config.slotSelector)

    if (elements.length > 0) {
      for (const element of elements) {
        const text = await page.evaluate((el: HTMLElement) => el.textContent?.toLowerCase(), element)
        if (text?.includes(config.availableText.toLowerCase())) {
          return { disponible: true, mensaje: 'Turno detectado' }
        }
      }
    }

    return { disponible: false, mensaje: 'No se detectaron turnos disponibles' }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error)
    return { disponible: false, mensaje: 'Error en scraping' }
  }
}

export async function checkDisponibilidad(tramiteId: string): Promise<SlotResult> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

    const tramite = TRAMITES_DISPONIBLES.find(t => t.id === tramiteId)
    if (!tramite) {
      return { disponible: false, mensaje: 'Trámite no encontrado' }
    }

    // Usar scraper específico según institución
    if (tramite.institucion === 'Registro Civil') {
      return await scrapeRegistroCivil(page, tramiteId)
    } else {
      return await scrapeGenerico(page, tramite.url, tramiteId)
    }
  } finally {
    await browser.close()
  }
}

export async function runScraperLoop() {
  console.log('[Scraper] Iniciando loop de verificación...')

  const activeAlerts = await prisma.alert.findMany({
    where: { activo: true },
    include: {
      user: true,
      tramite: true
    }
  })

  console.log(`[Scraper] ${activeAlerts.length} alertas activas para verificar`)

  for (const alert of activeAlerts) {
    try {
      const result = await checkDisponibilidad(alert.tramite.id)

      if (result.disponible) {
        console.log(`[ALERTA] Turno disponible para ${alert.tramite.nombre}`)

        // Guardar el slot detectado
        await prisma.slot.create({
          data: {
            tramiteId: alert.tramite.id,
            fecha: new Date(),
            disponible: true
          }
        })

        // Enviar notificación si corresponde
        if (alert.notificarEmail) {
          await sendEmailAlert({
            email: alert.user.email,
            tramiteNombre: alert.tramite.nombre,
            institucion: alert.tramite.institucion,
            urlAgendamiento: alert.tramite.url
          })

          await prisma.notificationLog.create({
            data: {
              alertId: alert.id,
              tipo: 'EMAIL',
              estado: 'ENVIADO',
              mensaje: `Turno disponible: ${alert.tramite.nombre}`
            }
          })
        }
      }

      // Rate limiting - esperar entre scrapers
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`Error procesando alerta ${alert.id}:`, error)
    }
  }
}
