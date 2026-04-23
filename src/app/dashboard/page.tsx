'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Alert, Bell, CheckCircle, Clock, Trash2, XCircle } from 'lucide-react'
import { Header } from '@/components/Header'
import { toast } from 'sonner'

interface Alerta {
  id: string
  activo: boolean
  notificarEmail: boolean
  notificarWhatsapp: boolean
  notificarPush: boolean
  createdAt: string
  tramite: {
    id: string
    nombre: string
    institucion: string
    url: string
    activo: boolean
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchAlertas()
    }
  }, [session])

  const fetchAlertas = async () => {
    try {
      const res = await fetch('/api/alerts')
      if (res.ok) {
        const data = await res.json()
        setAlertas(data)
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const eliminarAlerta = async (alertId: string) => {
    try {
      const res = await fetch('/api/alerts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      })

      if (res.ok) {
        setAlertas(alertas.filter(a => a.id !== alertId))
        toast.success('Alerta eliminada')
      }
    } catch (error) {
      toast.error('Error al eliminar alerta')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chile-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hola, {session?.user?.name || session?.user?.email}
          </h1>
          <p className="text-gray-600">
            Gestiona tus alertas de turnos gubernamentales
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bell className="w-6 h-6 text-chile-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Alertas activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alertas.filter(a => a.activo).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Turnos detectados</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Última verificación</p>
                <p className="text-sm font-medium text-gray-900">Hace 5 min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Mis Alertas</h2>
          </div>

          {alertas.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes alertas creadas
              </h3>
              <p className="text-gray-600 mb-4">
                Crea una alerta para ser notificado cuando haya turnos disponibles
              </p>
              <a
                href="/tramites"
                className="inline-flex items-center gap-2 bg-chile-blue hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Ver trámites disponibles
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${alerta.activo ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <h3 className="font-medium text-gray-900">{alerta.tramite.nombre}</h3>
                      <p className="text-sm text-gray-600">{alerta.tramite.institucion}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {alerta.notificarEmail && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Email</span>
                        )}
                        {alerta.notificarWhatsapp && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">WhatsApp</span>
                        )}
                        {alerta.notificarPush && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Push</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${alerta.activo ? 'text-green-600' : 'text-gray-400'}`}>
                      {alerta.activo ? 'Activa' : 'Inactiva'}
                    </span>
                    <button
                      onClick={() => eliminarAlerta(alerta.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
