'use client'

import { useSession } from 'next-auth/react'
import { Header } from '@/components/Header'
import { TramitesList } from '@/components/TramitesList'
import { ArrowLeft, Bell } from 'lucide-react'
import Link from 'next/link'

export default function TramitesPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Trámites Disponibles
            </h1>
            <span className="bg-chile-blue text-white text-sm font-medium px-3 py-1 rounded-full">
              {session ? 'Puede crear alertas' : 'Inicia sesión para crear alertas'}
            </span>
          </div>

          <p className="text-gray-600">
            Selecciona los trámites que quieres monitorear. Te notificaremos cuando haya turnos disponibles.
          </p>
        </div>

        <TramitesList />

        {/* Info box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Bell className="w-6 h-6 text-chile-blue mt-0.5" />
            <div>
              <h3 className="font-semibold text-chile-blue mb-1">
                ¿Cómo funciona?
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Nuestro sistema verifica la disponibilidad cada 5 minutos</li>
                <li>• Cuando detecta un turno disponible, te enviamos una notificación inmediata</li>
                <li>• Recibes un email con el enlace directo para agendar</li>
                <li>• Los turnos se agotan rápido, ¡actúa rápido cuando recibas la alerta!</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
