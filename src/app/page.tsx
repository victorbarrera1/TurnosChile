'use client'

import { SessionProvider } from 'next-auth/react'
import { Header } from '@/components/Header'
import { TramitesList } from '@/components/TramitesList'
import { ArrowRight, Bell, CheckCircle, Clock, Shield } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header />

        {/* Hero */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-chile-blue/10 text-chile-blue font-medium px-4 py-2 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-chile-blue"></span>
              </span>
              Monitoreo en tiempo real 24/7
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Nunca más pierdas un{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-chile-red to-chile-blue">
                turno gubernamental
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Monitoreamos automáticamente la disponibilidad de turnos para trámites en el
              Registro Civil, SEREMI, SII y más. Te avisamos inmediatamente cuando hay disponibilidad.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/tramites"
                className="inline-flex items-center gap-2 bg-chile-red hover:bg-red-700 text-white font-medium px-8 py-4 rounded-xl transition-colors text-lg"
              >
                Crear alerta gratuita
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-8 py-4 rounded-xl border border-gray-300 transition-colors text-lg"
              >
                Saber más
              </a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-y border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-chile-blue mb-2">7</p>
                <p className="text-gray-600">Trámites monitoreados</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-chile-blue mb-2">24/7</p>
                <p className="text-gray-600">Monitoreo constante</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-chile-blue mb-2">&lt;5min</p>
                <p className="text-gray-600">Tiempo de notificación</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-chile-blue mb-2">100%</p>
                <p className="text-gray-600">Gratis</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trámites */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Trámites disponibles
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Monitoreamos los trámites más solicitados en las instituciones gubernamentales más importantes de Chile
              </p>
            </div>

            <TramitesList />
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¿Cómo funciona?
              </h2>
              <p className="text-gray-600">
                Tres simples pasos para nunca más perder un turno
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-chile-blue text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Crea una alerta
                </h3>
                <p className="text-gray-600">
                  Regístrate gratis y selecciona los trámites que necesitas monitorear
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-chile-blue text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Espera la notificación
                </h3>
                <p className="text-gray-600">
                  Nuestro sistema monitorea 24/7 y te avisa cuando hay disponibilidad
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-chile-blue text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Agenda tu turno
                </h3>
                <p className="text-gray-600">
                  Recibes un email con el enlace directo para reservar inmediatamente
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-chile-blue to-blue-800 text-white rounded-2xl p-8">
                <Shield className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">100% Seguro</h3>
                <p className="text-blue-100">
                  Tus datos están protegidos con encriptación de nivel bancario.
                  Nunca compartimos tu información con terceros.
                </p>
              </div>

              <div className="bg-gradient-to-br from-chile-red to-red-700 text-white rounded-2xl p-8">
                <Clock className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Notificaciones Instantáneas</h3>
                <p className="text-red-100">
                  Te avisamos en menos de 5 minutos desde que detectamos disponibilidad.
                  Email, WhatsApp o push notifications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-chile-blue to-chile-red text-white rounded-3xl p-12">
              <Bell className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">
                ¿Listo para comenzar?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Crea tu cuenta gratis y comienza a monitorear turnos hoy mismo
              </p>
              <Link
                href="/login?mode=register"
                className="inline-flex items-center gap-2 bg-white text-chile-red hover:bg-gray-50 font-bold px-8 py-4 rounded-xl transition-colors text-lg"
              >
                Crear cuenta gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-12 px-4 bg-white">
          <div className="max-w-6xl mx-auto text-center text-gray-600">
            <p className="mb-2">
              🇨🇱 Hecho con ❤️ para Chile
            </p>
            <p className="text-sm">
              TurnosChile no está afiliado con ninguna institución gubernamental.
              Los nombres Registro Civil, SEREMI, SII son marcas registradas de sus respectivos dueños.
            </p>
          </div>
        </footer>
      </div>
    </SessionProvider>
  )
}
