# 🚀 Cómo Empezar con TurnosChile

## Requisitos Previos

1. **Node.js 18+** instalado
2. **PostgreSQL** (puedes usar Supabase gratis: https://supabase.com)
3. **Resend** para emails (https://resend.com - gratis hasta 3000 emails/mes)

## Paso a Paso

### 1. Instalar dependencias

```bash
cd turnos-chile
npm install
```

### 2. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# 1. Crea una DB en Supabase y pega tu connection string
DATABASE_URL="postgresql://postgres:[password]@[host].supabase.co:5432/postgres"

# 2. Genera un secreto aleatorio
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# 3. URL local (cambiar a tu dominio en producción)
NEXTAUTH_URL="http://localhost:3000"

# 4. Crea una cuenta en Resend y obtén tu API key
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="TurnosChile <noreply@tusdominio.com>"
```

### 3. Configurar base de datos

```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear tablas en la DB
npm run db:push

# Insertar trámites iniciales
npm run db:seed
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## Primeros Pasos en la App

1. **Regístrate**: Ve a `/login?mode=register` y crea una cuenta
2. **Crea alertas**: Ve a `/tramites` y selecciona los trámites que quieres monitorear
3. **Revisa tu dashboard**: En `/dashboard` verás tus alertas activas

## Ejecutar el Scraper

El scraper se ejecuta automáticamente cada 5 minutos vía Vercel Cron (en producción).

Para probarlo localmente:

```bash
npm run scraper:run
```

## Deploy a Producción

### Vercel (Recomendado)

1. Instala Vercel CLI: `npm i -g vercel`
2. Ejecuta: `vercel`
3. Configura las variables de entorno en el dashboard de Vercel
4. ¡Listo!

### Variables en Vercel

Asegúrate de configurar:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (tu dominio de producción)
- `RESEND_API_KEY`
- `EMAIL_FROM`

## Posibles Problemas

### Error: "Prisma Client no generado"
```bash
npm run db:generate
```

### Error: "DATABASE_URL no definido"
Verifica que tu `.env` tenga la URL correcta de Supabase.

### Error: "Module not found: clsx"
```bash
npm install clsx tailwind-merge
```

## Siguientes Pasos

1. **Personaliza los trámites**: Edita `src/lib/tramites.ts` para agregar/quitar trámites
2. **Ajusta el scraper**: Modifica `src/lib/scraper.ts` según los sitios que quieras monitorear
3. **Configura WhatsApp**: Agrega tus credenciales de Twilio en `.env` para notificaciones por WhatsApp

## ¿Necesitas Ayuda?

- Documentación de Next.js: https://nextjs.org/docs
- Documentación de Prisma: https://www.prisma.io/docs
- Documentación de Supabase: https://supabase.com/docs

---

**Hecho con ❤️ para Chile** 🇨🇱
