import { chromium, type Browser, type Page } from 'playwright'
import { prisma } from './prisma'
import { sendEmailAlert } from './notifications'

const SRCEI_BASE = 'https://solicitudeswebrc.srcei.cl/ReservaDeHoraSRCEI'
const CLAVE_UNICA_LOGIN = `${SRCEI_BASE}/web/init.srcei`
const EXTRANJERO_INIT = `${SRCEI_BASE}/web/extranjero/init.srcei`

const STEALTH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-blink-features=AutomationControlled',
  '--disable-dev-shm-usage',
]

export interface SlotResult {
  disponible: boolean
  mensaje?: string
  oficina?: string
  region?: string
  slots?: string[]
  urlAgendamiento?: string
}

async function createBrowser(): Promise<Browser> {
  return chromium.launch({ headless: true, args: STEALTH_ARGS })
}

async function createStealthPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-CL',
    timezoneId: 'America/Santiago',
    viewport: { width: 1280, height: 800 },
  })
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] })
    Object.defineProperty(navigator, 'languages', { get: () => ['es-CL', 'es', 'en'] })
    // @ts-ignore
    window.chrome = { runtime: {} }
  })
  return context.newPage()
}

// F5 BIG-IP sends a challenge on first load, then the real page arrives.
// We wait for a specific element that only appears on the real page.
async function loadWithBotBypass(page: Page, url: string, readySelector: string): Promise<boolean> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  try {
    await page.waitForSelector(readySelector, { timeout: 15000 })
    return true
  } catch {
    return false
  }
}

// ─── EXTRANJERO FLOW (no ClaveÚnica required) ───────────────────────────────

export async function checkDisponibilidadExtranjero(): Promise<SlotResult> {
  const browser = await createBrowser()
  try {
    const page = await createStealthPage(browser)

    const loaded = await loadWithBotBypass(page, EXTRANJERO_INIT, '#selectTipoDocumento')
    if (!loaded) {
      return { disponible: false, mensaje: 'Protección bot activa — no se cargó el formulario' }
    }

    // Read real option values (server sends ' P' with leading space for Pasaporte)
    const pasaporteValue = await page.evaluate(() => {
      const sel = document.getElementById('selectTipoDocumento') as HTMLSelectElement | null
      return Array.from(sel?.options || []).find(o => /pasaporte/i.test(o.text))?.value?.trim() ?? 'P'
    })
    const argentinaValue = await page.evaluate(() => {
      const sel = document.getElementById('selectPais') as HTMLSelectElement | null
      return Array.from(sel?.options || []).find(o => o.text.includes('ARGENTINA'))?.value ?? '79_32'
    })

    // Fill the form using Playwright native methods to maintain session/CSRF token
    await page.selectOption('#selectTipoDocumento', { value: pasaporteValue })
    await page.fill('#idNumeroDeDocumento', 'PA123456')
    await page.fill('#idNombres', 'Juan')
    await page.fill('#idPrimerApellido', 'Garcia')
    await page.fill('#idSegundoApellido', 'Lopez')
    // Date field is readonly (bootstrap-datepicker) — must set via JS
    await page.evaluate(() => {
      const input = document.getElementById('idFechaNacimiento') as HTMLInputElement | null
      if (input) {
        input.removeAttribute('readonly')
        input.value = '01/01/1985'
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    await page.selectOption('#selectPais', argentinaValue)
    await page.fill('#idCorreo1', 'test@turnos.test')
    await page.fill('#idCorreo2', 'test@turnos.test')
    await page.fill('#idTelefono', '912345678')
    await page.fill('#idTelefono2', '912345678')

    // Click submit — the page JS POSTs to oficina.srcei
    const navPromise = page
      .waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 })
      .catch(() => null)
    await page.click('#idBtnContinuar')
    await navPromise
    await page.waitForTimeout(3000)

    const currentUrl = page.url()
    if (!currentUrl.includes('oficina.srcei')) {
      return { disponible: false, mensaje: `Formulario rechazado — redirigido a ${currentUrl}` }
    }

    // Detect "alta demanda" (server overload) — retry up to 3 times
    for (let intento = 1; intento <= 3; intento++) {
      const bodyText = await page.evaluate(() => document.body?.innerText || '')
      if (/alta demanda|intente nuevamente/i.test(bodyText)) {
        if (intento === 3) {
          return { disponible: false, mensaje: 'SRCEI con alta demanda — reintentar más tarde' }
        }
        console.log(`[Scraper] Alta demanda detectada, reintento ${intento}/3...`)
        await page.waitForTimeout(5000)
        const retryNav = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null)
        await page.evaluate(() => (document.getElementById('btn_error_aceptar') as HTMLButtonElement | null)?.click())
        await retryNav
        await page.waitForTimeout(3000)
      } else {
        break
      }
    }

    return await detectarSlots(page)
  } finally {
    await browser.close()
  }
}

// ─── CHILENO FLOW (requires ClaveÚnica credentials) ─────────────────────────

export async function checkDisponibilidadChileno(
  rut: string,
  claveUnica: string,
): Promise<SlotResult> {
  const browser = await createBrowser()
  try {
    const page = await createStealthPage(browser)

    const loaded = await loadWithBotBypass(page, CLAVE_UNICA_LOGIN, '#cu_inputRUN')
    if (!loaded) {
      return { disponible: false, mensaje: 'No se cargó la pantalla de ClaveÚnica' }
    }

    await page.fill('#cu_inputRUN', rut)
    await page.fill('#cu_inputClaveUnica', claveUnica)

    const navPromise = page
      .waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 })
      .catch(() => null)
    await page.click('#cu_btnIngresar')
    await navPromise
    await page.waitForTimeout(4000)

    const afterLoginUrl = page.url()
    if (afterLoginUrl.includes('init.srcei')) {
      const errorText = await page.evaluate(
        () => (document.getElementById('cu_textAdvError') as HTMLElement | null)?.innerText || '',
      )
      return {
        disponible: false,
        mensaje: `Error ClaveÚnica: ${errorText || 'credenciales inválidas'}`,
      }
    }

    return await detectarSlots(page)
  } finally {
    await browser.close()
  }
}

// ─── SLOT DETECTION (shared by both flows) ───────────────────────────────────

async function detectarSlots(page: Page): Promise<SlotResult> {
  const regions = await page.evaluate(() => {
    const sel = document.getElementById('selectRegion') as HTMLSelectElement | null
    if (!sel) return []
    return Array.from(sel.options)
      .filter((o) => o.value !== '-1')
      .map((o) => ({ value: o.value, text: o.text.trim() }))
  })

  if (regions.length === 0) {
    return { disponible: false, mensaje: 'No se encontró selector de regiones en la página' }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const fechaStr = [
    String(tomorrow.getDate()).padStart(2, '0'),
    String(tomorrow.getMonth() + 1).padStart(2, '0'),
    tomorrow.getFullYear(),
  ].join('/')

  for (const region of regions) {
    await page.selectOption('#selectRegion', region.value)
    // Wait for busquedaOficinasActivas AJAX to complete
    await page.waitForTimeout(2500)

    const offices = await page.evaluate(() => {
      const sel = document.getElementById('selectOficinas') as HTMLSelectElement | null
      if (!sel || sel.disabled) return []
      return Array.from(sel.options)
        .filter((o) => o.value !== '-1')
        .map((o) => ({ value: o.value, text: o.text.trim() }))
    })

    for (const office of offices) {
      await page.selectOption('#selectOficinas', office.value)

      await page.evaluate((fecha) => {
        const input = document.getElementById('idFechaSeleccionadaDesde') as HTMLInputElement | null
        if (input) {
          input.value = fecha
          input.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }, fechaStr)

      const btnBuscar = await page.$('#idBtnBuscarFechaDisponible')
      if (!btnBuscar) continue

      await btnBuscar.click()
      // Wait for busquedaHoraDisponible AJAX to complete and DOM to update
      await page.waitForTimeout(3500)

      const slots = await page.evaluate(() => {
        const container = document.getElementById('idHorasDisponiblesContainer')
        if (!container) return []
        return Array.from(
          container.querySelectorAll('.btnAgendar, [class*="agendar"], [class*="disponible"]'),
        ).map((el) => el.textContent?.trim() || '')
      })

      const bodySnippet = await page.evaluate(() => {
        const container =
          document.getElementById('idHorasDisponiblesContainer') ||
          document.getElementById('idHorasDisponiblesMainContainer')
        return (container as HTMLElement | null)?.innerText?.toLowerCase() || ''
      })

      if (slots.length > 0 || /disponible|agendar|hora libre/.test(bodySnippet)) {
        return {
          disponible: true,
          mensaje: `${slots.length || '+'} turno(s) disponible(s) en ${office.text} (${region.text})`,
          oficina: office.text,
          region: region.text,
          slots: slots.filter(Boolean),
        }
      }

      // Re-enable controls for the next iteration
      await page.evaluate(() => {
        ;(document.getElementById('selectRegion') as HTMLSelectElement | null)?.removeAttribute('disabled')
        ;(document.getElementById('selectOficinas') as HTMLSelectElement | null)?.removeAttribute('disabled')
        ;(
          document.getElementById('idFechaSeleccionadaDesde') as HTMLInputElement | null
        )?.removeAttribute('disabled')
        const btn = document.getElementById('idBtnBuscarContainer')
        if (btn) btn.style.display = ''
      })

      await page.waitForTimeout(500)
    }
  }

  return { disponible: false, mensaje: 'Sin turnos disponibles en ninguna oficina' }
}

// ─── MAIN SCRAPER LOOP ────────────────────────────────────────────────────────

export async function runScraperLoop() {
  console.log('[Scraper] Iniciando verificación...')

  const activeAlerts = await prisma.alert.findMany({
    where: { activo: true },
    include: { user: true, tramite: true },
  })

  console.log(`[Scraper] ${activeAlerts.length} alertas activas`)

  for (const alert of activeAlerts) {
    try {
      let result: SlotResult

      if (alert.tramite.id === 'extranjero') {
        result = await checkDisponibilidadExtranjero()
      } else {
        // Chilean tramites require ClaveÚnica — skip until credentials are stored
        console.log(`[Scraper] ${alert.tramite.id} requiere ClaveÚnica — saltando`)
        continue
      }

      console.log(`[Scraper] ${alert.tramite.nombre}: ${result.mensaje}`)

      if (result.disponible) {
        await prisma.slot.create({
          data: { tramiteId: alert.tramite.id, fecha: new Date(), disponible: true },
        })

        if (alert.notificarEmail) {
          await sendEmailAlert({
            email: alert.user.email,
            tramiteNombre: alert.tramite.nombre,
            institucion: alert.tramite.institucion,
            urlAgendamiento: result.urlAgendamiento || alert.tramite.url,
          })
          await prisma.notificationLog.create({
            data: {
              alertId: alert.id,
              tipo: 'EMAIL',
              estado: 'ENVIADO',
              mensaje: result.mensaje || 'Turno disponible detectado',
            },
          })
        }
      }
    } catch (error) {
      console.error(`[Scraper] Error en alerta ${alert.id}:`, error)
      await prisma.notificationLog.create({
        data: {
          alertId: alert.id,
          tipo: 'EMAIL',
          estado: 'FALLIDO',
          mensaje: error instanceof Error ? error.message : 'Error desconocido',
        },
      })
    }

    await new Promise((r) => setTimeout(r, 3000))
  }

  console.log('[Scraper] Ciclo completado')
}

// Legacy export used by scraper-worker.ts and API route
export async function checkDisponibilidad(tramiteId: string): Promise<SlotResult> {
  if (tramiteId === 'extranjero') {
    return checkDisponibilidadExtranjero()
  }
  return { disponible: false, mensaje: 'Este trámite requiere ClaveÚnica — configura tus credenciales en el dashboard' }
}
