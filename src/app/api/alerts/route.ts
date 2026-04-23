import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const alerts = await prisma.alert.findMany({
      where: { userId: session.user.id },
      include: {
        tramite: {
          select: {
            id: true,
            nombre: true,
            institucion: true,
            url: true,
            activo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Error al obtener alertas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { tramiteId, notificarWhatsapp } = body

    if (!tramiteId) {
      return NextResponse.json(
        { error: 'tramiteId requerido' },
        { status: 400 }
      )
    }

    const tramite = await prisma.tramite.findUnique({
      where: { id: tramiteId }
    })

    if (!tramite) {
      return NextResponse.json(
        { error: 'Trámite no encontrado' },
        { status: 404 }
      )
    }

    const alert = await prisma.alert.upsert({
      where: {
        userId_tramiteId: {
          userId: session.user.id,
          tramiteId
        }
      },
      update: {
        activo: true,
        notificarWhatsapp: notificarWhatsapp || false
      },
      create: {
        userId: session.user.id,
        tramiteId,
        activo: true,
        notificarEmail: true,
        notificarWhatsapp: notificarWhatsapp || false,
        notificarPush: true
      }
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Error al crear alerta' },
      { status: 500 }
    )
  }
}
