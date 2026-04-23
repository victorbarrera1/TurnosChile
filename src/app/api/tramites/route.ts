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

    const tramites = await prisma.tramite.findMany({
      where: { activo: true },
      include: {
        _count: {
          select: { slots: true }
        }
      },
      orderBy: { nombre: 'asc' }
    })

    return NextResponse.json(tramites)
  } catch (error) {
    console.error('Error fetching tramites:', error)
    return NextResponse.json(
      { error: 'Error al obtener trámites' },
      { status: 500 }
    )
  }
}
