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

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

- `DATABASE_URL`: URL de PostgreSQL (Supabase)
- `NEXTAUTH_SECRET`: Generar con `openssl rand -base64 32`
- `NEXTAUTH_URL`: `http://localhost:3000` (local) o tu dominio
- `RESEND_API_KEY`: API key de Resend para emails

### 3. Configurar base de datos

```bash
# Generar cliente Prisma
npm run db:generate

# Push del schema a la DB
npm run db:push

# Seed inicial de trámites
npm run db:seed
```

## Desarrollo

```bash
npm run dev
```

La app corre en `http://localhost:3000`

## Scraper

El scraper se ejecuta automáticamente cada 5 minutos. Para ejecutarlo manualmente:

```bash
npm run scraper:run
```

## Deploy en Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

## Deploy del Scraper

Para producción, se recomienda:

1. **Vercel Cron**: Configurar cron job que llame a `/api/scraper` cada 5 min
2. **Worker independiente**: Deploy en Railway/Render que ejecute `scraper-worker.ts`

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

## Licencia

MIT
