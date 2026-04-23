'use client'

import { TRAMITES_DISPONIBLES } from '@/lib/tramites'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BadgeCheck, Bell, Building, ChevronRight, Globe, Lock } from 'lucide-react'

export function TramitesList() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)

  const crearAlerta = async (tramiteId: string) => {
    if (!session) {
      window.location.href = '/login'
      return
    }

    setLoading(tramiteId)

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tramiteId })
      })

      if (res.ok) {
        toast.success('¡Alerta creada! Te notificaremos cuando haya turnos')
      } else {
        toast.error('Error al crear la alerta')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-4">
      {TRAMITES_DISPONIBLES.map((tramite) => (
        <div
          key={tramite.id}
          className="bg-white border border-gray-200 rounded-xl p-6 hover:border-chile-blue transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {tramite.nombre}
                </h3>
                {tramite.prioridad === 'alta' && (
                  <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                    Más solicitado
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-gray-600 text-sm mb-3">
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {tramite.institucion}
                </span>
                {tramite.requiereLogin && (
                  <span className="flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    Requiere login
                  </span>
                )}
              </div>

              <p className="text-gray-600">{tramite.descripcion}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => crearAlerta(tramite.id)}
                disabled={loading === tramite.id}
                className="flex items-center gap-2 bg-chile-blue hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <Bell className="w-4 h-4" />
                {loading === tramite.id ? 'Creando...' : 'Crear alerta'}
              </button>

              <a
                href={tramite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-chile-blue"
              >
                <Globe className="w-3 h-3" />
                Sitio oficial
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
