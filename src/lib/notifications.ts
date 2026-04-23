import nodemailer from 'nodemailer'
import { resend } from './email'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: 587,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY || '',
  },
})

interface AlertaData {
  email: string
  tramiteNombre: string
  institucion: string
  fechaSlot?: string
  urlAgendamiento: string
}

export async function sendEmailAlert(data: AlertaData) {
  const { email, tramiteNombre, institucion, fechaSlot, urlAgendamiento } = data

  const subject = `🎉 ¡Turno disponible para ${tramiteNombre}!`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0039A6 0%, #D52B1E 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
          .alert-box { background: #dcfce7; border: 2px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .alert-box h2 { color: #166534; margin: 0 0 10px 0; }
          .tramite-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .cta-button { display: inline-block; background: #D52B1E; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🇨🇱 TurnosChile</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">¡Hay un turno disponible!</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2>🎉 ¡Buena noticia!</h2>
              <p>Se ha detectado un turno disponible para el trámite que estás monitoreando.</p>
            </div>

            <div class="tramite-info">
              <p style="margin: 0; color: #64748b; font-size: 14px;">Trámite</p>
              <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 600;">${tramiteNombre}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;">${institucion}</p>
              ${fechaSlot ? `<p style="margin: 8px 0 0 0;"><strong>Fecha:</strong> ${fechaSlot}</p>` : ''}
            </div>

            <p style="color: #64748b; margin-top: 20px;">
              ⚠️ Los turnos se agotan rápido. Te recomendamos agendar inmediatamente.
            </p>

            <div style="text-align: center;">
              <a href="${urlAgendamiento}" class="cta-button">Agendar ahora →</a>
            </div>

            <p style="color: #94a3b8; font-size: 13px; margin-top: 30px; text-align: center;">
              Esta alerta fue enviada automáticamente por TurnosChile.<br>
              Puedes gestionar tus alertas en tu dashboard.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'TurnosChile <noreply@turnoschile.cl>',
      to: email,
      subject,
      html,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}
