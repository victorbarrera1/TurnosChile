# TurnosChile 🇨🇱

Monitor de turnos gubernamentales para trámites en Chile.

## Descripción

TurnosChile monitorea automáticamente la disponibilidad de turnos para trámites en instituciones gubernamentales chilenas (Registro Civil, SEREMI, SII, etc.) y notifica a los usuarios cuando hay disponibilidad.

## Stack Técnico

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js
- **Scraping**: Puppeteer
- **Email**: Resend
- **Deploy**: Vercel + Supabase


## Trámites Soportados

| Trámite | Institución |
|---------|-------------|
| Pasaporte | Registro Civil |
| Cédula de Identidad | Registro Civil |
| Certificado de Antecedentes | Registro Civil |
| Certificado de Nacimiento | Registro Civil |
| Permiso SEREMI de Salud | SEREMI Salud RM |
| Inscripción Consular | Minrel |
| Inicio de Actividades SII | SII |


Victor Barrera, Abril 2026
