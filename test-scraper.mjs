import { chromium } from 'playwright'

const SRCEI_BASE = 'https://solicitudeswebrc.srcei.cl/ReservaDeHoraSRCEI'
const EXTRANJERO_INIT = `${SRCEI_BASE}/web/extranjero/init.srcei`
const STEALTH_ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage']

async function createPage(browser) {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-CL', timezoneId: 'America/Santiago', viewport: { width: 1280, height: 800 },
  })
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] })
    Object.defineProperty(navigator, 'languages', { get: () => ['es-CL', 'es', 'en'] })
    window.chrome = { runtime: {} }
  })
  return context.newPage()
}

async function main() {
  console.log('[Test] Iniciando scraper Registro Civil extranjero...')
  const browser = await chromium.launch({ headless: true, args: STEALTH_ARGS })

  try {
    const page = await createPage(browser)

    page.on('response', async (res) => {
      const url = res.url()
      if (url.includes('srcei.cl') && !url.includes('TSPD') && !url.match(/\.(js|css|png|jpg|otf|woff)(\?|$)/)) {
        let body = ''
        try { body = (await res.text()).substring(0, 400) } catch (_) {}
        if (body && body.length > 10 && !body.includes('bobcmn')) {
          console.log(`[Net ${res.status()}] ${url.replace(SRCEI_BASE, '')}`)
          if (body.includes('{') || body.includes('[') || /disponible|oficina|region|hora/i.test(body)) {
            console.log('  →', body.substring(0, 300))
          }
        }
      }
    })

    // Step 1: Load init
    console.log('\n[1] Cargando init.srcei...')
    await page.goto(EXTRANJERO_INIT, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForSelector('#selectTipoDocumento', { timeout: 15000 })
    console.log('    ✓ Formulario cargado')

    // Read real option values first
    const tipoOpts = await page.evaluate(() =>
      Array.from(document.getElementById('selectTipoDocumento').options)
        .map(o => ({ value: o.value, text: o.text.trim() }))
    )
    const paisOpts = await page.evaluate(() =>
      Array.from(document.getElementById('selectPais').options)
        .filter(o => o.text.includes('ARGENTINA'))
        .map(o => ({ value: o.value, text: o.text.trim() }))
    )
    console.log('    Opciones tipoDocumento:', tipoOpts)
    console.log('    Opción Argentina:', paisOpts[0])

    // Trim spaces from option values (the server sends ' P' for Pasaporte)
    const pasaporteValue = tipoOpts.find(o => /pasaporte/i.test(o.text))?.value?.trim()
    const argentinaValue = paisOpts[0]?.value

    if (!pasaporteValue) {
      console.log('    ✗ No se encontró opción Pasaporte')
      return
    }

    // Step 2: Fill form
    console.log('\n[2] Llenando formulario...')
    await page.selectOption('#selectTipoDocumento', { label: 'Pasaporte' })
    await page.fill('#idNumeroDeDocumento', 'PA123456')
    await page.fill('#idNombres', 'Juan')
    await page.fill('#idPrimerApellido', 'Garcia')
    await page.fill('#idSegundoApellido', 'Lopez')
    // Date field is readonly (bootstrap-datepicker) — set via JS
    await page.evaluate(() => {
      const input = document.getElementById('idFechaNacimiento')
      if (input) {
        input.removeAttribute('readonly')
        input.value = '01/01/1985'
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    await page.selectOption('#selectPais', argentinaValue || '79_32')
    await page.fill('#idCorreo1', 'test@turnos.test')
    await page.fill('#idCorreo2', 'test@turnos.test')
    await page.fill('#idTelefono', '912345678')
    await page.fill('#idTelefono2', '912345678')
    console.log('    ✓ Campos llenados')

    // Step 3: Submit
    console.log('\n[3] Enviando a oficina.srcei...')
    const navPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null)
    await page.click('#idBtnContinuar')
    await navPromise
    await page.waitForTimeout(3000)

    const currentUrl = page.url()
    console.log('    URL:', currentUrl)

    if (!currentUrl.includes('oficina.srcei')) {
      const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 400))
      console.log('\n✗ No llegamos a oficina.srcei')
      console.log('  Contenido:', bodyText)
      return
    }
    console.log('    ✓ Página de oficinas cargada!')

    // Step 4: Inspect oficina page structure
    console.log('\n[4] Inspeccionando página oficina.srcei...')
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 800))
    console.log('    Body:', bodyText)

    const allSelects = await page.evaluate(() =>
      Array.from(document.querySelectorAll('select')).map(sel => ({
        id: sel.id,
        name: sel.name,
        options: Array.from(sel.options).map(o => ({ value: o.value, text: o.text.trim() }))
      }))
    )
    console.log('    Selects:', JSON.stringify(allSelects, null, 2))

    const allInputs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input, button')).map(el => ({
        id: el.id, type: el.getAttribute('type'), placeholder: el.getAttribute('placeholder'), text: el.textContent?.trim()
      }))
    )
    console.log('    Inputs/Buttons:', JSON.stringify(allInputs, null, 2))

    const regions = await page.evaluate(() => {
      const sel = document.getElementById('selectRegion')
      if (!sel) return []
      return Array.from(sel.options).filter(o => o.value !== '-1').map(o => ({ value: o.value, text: o.text.trim() }))
    })
    console.log(`    Regiones: ${regions.length}`)
    regions.forEach(r => console.log(`    - ${r.text} (${r.value})`))

    if (!regions.length) { console.log('✗ Sin regiones — ver estructura arriba'); return }

    // Step 5: Check first 3 regions for offices and slots
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const fechaStr = [String(tomorrow.getDate()).padStart(2,'0'), String(tomorrow.getMonth()+1).padStart(2,'0'), tomorrow.getFullYear()].join('/')
    console.log(`\n[5] Buscando slots para ${fechaStr}...`)

    for (const region of regions.slice(0, 3)) {
      console.log(`\n  → Región: ${region.text}`)
      await page.selectOption('#selectRegion', region.value)
      await page.waitForTimeout(2500)

      const offices = await page.evaluate(() => {
        const sel = document.getElementById('selectOficinas')
        if (!sel || sel.disabled) return []
        return Array.from(sel.options).filter(o => o.value !== '-1').map(o => ({ value: o.value, text: o.text.trim() }))
      })
      console.log(`    Oficinas: ${offices.length}`)
      offices.forEach(o => console.log(`      · ${o.text} (${o.value})`))

      for (const office of offices.slice(0, 2)) {
        console.log(`\n    Buscando en: ${office.text}`)
        await page.selectOption('#selectOficinas', office.value)
        await page.evaluate((fecha) => {
          const input = document.getElementById('idFechaSeleccionadaDesde')
          if (input) { input.value = fecha; input.dispatchEvent(new Event('change', { bubbles: true })) }
        }, fechaStr)

        await page.click('#idBtnBuscarFechaDisponible')
        await page.waitForTimeout(4000)

        const result = await page.evaluate(() => {
          const c = document.getElementById('idHorasDisponiblesContainer')
          if (!c) return { slots: [], text: 'Sin contenedor' }
          const btns = Array.from(c.querySelectorAll('.btnAgendar, [class*="agendar"]')).map(el => el.textContent?.trim())
          return { slots: btns, text: c.innerText?.substring(0, 400) || '' }
        })

        if (result.slots.length > 0) {
          console.log(`    ✅ SLOTS DISPONIBLES: ${result.slots.join(', ')}`)
        } else {
          console.log(`    ℹ Sin slots — respuesta: ${result.text || '(vacío)'}`)
        }

        // Re-enable controls
        await page.evaluate(() => {
          document.getElementById('selectRegion')?.removeAttribute('disabled')
          document.getElementById('selectOficinas')?.removeAttribute('disabled')
          document.getElementById('idFechaSeleccionadaDesde')?.removeAttribute('disabled')
          const btn = document.getElementById('idBtnBuscarContainer')
          if (btn) btn.style.display = ''
        })
        await page.waitForTimeout(500)
      }
    }

    console.log('\n[Test] ✓ Scraper completado — funciona correctamente')

  } finally {
    await browser.close()
  }
}

main().catch(err => { console.error('[Test] Error:', err.message); process.exit(1) })
