// Configuración de trámites gubernamentales chilenos

export interface TramiteConfig {
  id: string
  nombre: string
  institucion: string
  descripcion: string
  url: string
  requiereLogin: boolean
  prioridad: 'alta' | 'media' | 'baja'
}

export const TRAMITES_DISPONIBLES: TramiteConfig[] = [
  {
    id: 'rc-pasaporte',
    nombre: 'Pasaporte',
    institucion: 'Registro Civil',
    descripcion: 'Retiro de pasaporte terminado',
    url: 'https://www.registrocivil.cl/',
    requiereLogin: true,
    prioridad: 'alta',
  },
  {
    id: 'rc-cedula',
    nombre: 'Cédula de Identidad',
    institucion: 'Registro Civil',
    descripcion: 'Retiro de carnet terminado',
    url: 'https://www.registrocivil.cl/',
    requiereLogin: true,
    prioridad: 'alta',
  },
  {
    id: 'rc-antecedentes',
    nombre: 'Certificado de Antecedentes',
    institucion: 'Registro Civil',
    descripcion: 'Certificado para fines especiales',
    url: 'https://www.registrocivil.cl/',
    requiereLogin: false,
    prioridad: 'media',
  },
  {
    id: 'rc-nacimiento',
    nombre: 'Certificado de Nacimiento',
    institucion: 'Registro Civil',
    descripcion: 'Certificado literal de nacimiento',
    url: 'https://www.registrocivil.cl/',
    requiereLogin: false,
    prioridad: 'media',
  },
  {
    id: 'seremi-salud',
    nombre: 'Permiso SEREMI de Salud',
    institucion: 'SEREMI Salud RM',
    descripcion: 'Permiso sanitario para eventos masivos',
    url: 'https://seremisaludrm.cl/',
    requiereLogin: true,
    prioridad: 'media',
  },
  {
    id: 'consulado-inscripcion',
    nombre: 'Inscripción Consular',
    institucion: 'Ministerio de Relaciones Exteriores',
    descripcion: 'Inscripción en consulado para chilenos en el extranjero',
    url: 'https://www.minrel.gob.cl/',
    requiereLogin: false,
    prioridad: 'baja',
  },
  {
    id: 'sii-inicio-actividades',
    nombre: 'Inicio de Actividades SII',
    institucion: 'SII',
    descripcion: 'Agendamiento para inicio de actividades',
    url: 'https://www.sii.cl/',
    requiereLogin: true,
    prioridad: 'alta',
  },
]

// Mapeo de selectores para scrapers (se actualiza según cambien los sitios)
export const SCRAPER_SELECTORS: Record<string, { slotSelector: string; availableText: string }> = {
  'rc-pasaporte': {
    slotSelector: '.slot-disponible, .agendar-hora',
    availableText: 'disponible',
  },
  'rc-cedula': {
    slotSelector: '.slot-disponible, .agendar-hora',
    availableText: 'disponible',
  },
  'seremi-salud': {
    slotSelector: '.fecha-disponible, .btn-agendar',
    availableText: 'Agendar',
  },
}
