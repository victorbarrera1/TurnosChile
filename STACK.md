# TurnosChile - Stack Técnico Completo

## 📁 Estructura del Proyecto

```
turnos-chile/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── alerts/
│   │   │   │   ├── route.ts          # GET/POST alertas
│   │   │   │   └── delete/
│   │   │   │       └── route.ts      # Eliminar alerta
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts      # NextAuth handler
│   │   │   │   └── register/
│   │   │   │       └── route.ts      # Registro usuarios
│   │   │   ├── scraper/
│   │   │   │   └── route.ts          # Endpoint scraper
│   │   │   └── tramites/
│   │   │       └── route.ts          # Listar trámites
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard usuario
│   │   ├── login/
│   │   │   └── page.tsx              # Login/Registro
│   │   ├── tramites/
│   │   │   └── page.tsx              # Lista de trámites
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page
│   ├── components/
│   │   ├── Button.tsx                # Componente Button
│   │   ├── Header.tsx                # Header navegación
│   │   └── TramitesList.tsx          # Lista trámites
│   ├── lib/
│   │   ├── auth.ts                   # Config NextAuth
│   │   ├── email.ts                  # Cliente Resend
│   │   ├── notifications.ts          # Envío de emails
│   │   ├── prisma.ts                 # Cliente Prisma
│   │   ├── scraper.ts                # Lógica scraping
│   │   ├── tramites.ts               # Config trámites
│   │   └── utils.ts                  # Utilidades CN
│   ├── scripts/
│   │   └── scraper-worker.ts         # Worker independiente
│   └── types/
│       └── next-auth.d.ts            # Types NextAuth
├── prisma/
│   ├── schema.prisma                 # Schema DB
│   └── seed.ts                       # Seed inicial
├── public/
├── .env.example                      # Variables entorno
├── .eslintrc.json
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json                       # Config Vercel + Crons
```

## 🛠️ Tecnologías

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 14.2.3 | Framework React |
| React | 18.3.1 | UI Library |
| TypeScript | 5.4.5 | Type safety |
| TailwindCSS | 3.4.3 | Estilos |
| Lucide React | 0.378.0 | Íconos |
| Sonner | 1.5.0 | Toast notifications |
| Zustand | 4.5.2 | State management |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js API Routes | - | API endpoints |
| NextAuth.js | 4.24.7 | Autenticación |
| Prisma | 5.14.0 | ORM |
| bcryptjs | 2.4.3 | Hash passwords |

### Scraping
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Puppeteer | 22.10.0 | Browser automation |
| Playwright | 1.44.1 | Alternative scraping |
| node-cron | 3.0.3 | Scheduled tasks |

### Notificaciones
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Resend | 3.2.0 | Email transactional |
| Twilio | 5.1.0 | WhatsApp (opcional) |
| web-push | 3.6.7 | Push notifications |

### Infraestructura
| Servicio | Propósito |
|----------|-----------|
| Vercel | Hosting + Serverless Functions |
| Supabase | PostgreSQL database |
| Resend | Email delivery |

## 📊 Base de Datos

### Tablas

#### User
- id, email, name, password (hashed)
- createdAt, updatedAt

#### Account (NextAuth)
- OAuth accounts para login social (futuro)

#### Tramite
- id, nombre, descripcion, institucion, url
- activo, createdAt, updatedAt

#### Alert
- id, userId, tramiteId
- activo, notificarEmail, notificarWhatsapp, notificarPush
- createdAt, updatedAt

#### Slot
- id, tramiteId, fecha, disponible, detectadoAt

#### NotificationLog
- id, alertId, tipo, estado, mensaje, createdAt

## 🔌 Endpoints API

### POST /api/auth/register
Registro de usuario
```json
{ "email": "user@example.com", "password": "123456", "name": "Juan" }
```

### POST /api/auth/signin
Login (NextAuth)

### GET /api/alerts
Obtener alertas del usuario autenticado

### POST /api/alerts
Crear nueva alerta
```json
{ "tramiteId": "rc-pasaporte", "notificarWhatsapp": false }
```

### POST /api/alerts/delete
Eliminar alerta
```json
{ "alertId": "abc123" }
```

### GET /api/tramites
Listar todos los trámites disponibles

### POST /api/scraper
Ejecutar scraper manualmente (protegido con API key)

## 🚀 Comandos

```bash
npm run dev          # Desarrollo local
npm run build        # Build producción
npm run start        # Start producción
npm run db:generate  # Generar Prisma client
npm run db:push      # Push schema a DB
npm run db:seed      # Seed inicial
npm run scraper:run  # Ejecutar scraper worker
```

## 🔐 Variables de Entorno

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="tu-secreto"
NEXTAUTH_URL="http://localhost:3000"

# Email
RESEND_API_KEY="re_xxx"
EMAIL_FROM="TurnosChile <noreply@tusdominio.com>"

# WhatsApp (opcional)
TWILIO_ACCOUNT_SID="ACxxx"
TWILIO_AUTH_TOKEN="token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Web Push
WEB_PUSH_PUBLIC_KEY="vapid-public"
WEB_PUSH_PRIVATE_KEY="vapid-private"

# Scraper
SCRAPER_INTERVAL_MINUTES="5"
```

## 📈 Modelo de Negocio

### Gratis (MVP)
- 3 alertas activas
- Notificaciones por email
- Verificación cada 5 minutos

### Premium (Futuro)
- $2.990/mes
- Alertas ilimitadas
- Notificaciones WhatsApp
- Verificación cada 1 minuto
- Prioridad en notificaciones

## 🎯 Próximas Features

1. Login social (Google, Facebook)
2. Dashboard con estadísticas
3. Historial de turnos detectados
4. Sistema de referidos
5. API pública para desarrolladores
6. App móvil (React Native)
