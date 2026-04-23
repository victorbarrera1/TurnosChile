import { PrismaClient } from '@prisma/client'
import { TRAMITES_DISPONIBLES } from '../src/lib/tramites'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de trámites...')

  // Crear trámites
  for (const tramite of TRAMITES_DISPONIBLES) {
    await prisma.tramite.upsert({
      where: { id: tramite.id },
      update: {},
      create: {
        id: tramite.id,
        nombre: tramite.nombre,
        descripcion: tramite.descripcion,
        institucion: tramite.institucion,
        url: tramite.url,
        activo: true,
      },
    })
    console.log(`  - ${tramite.nombre} (${tramite.institucion})`)
  }

  console.log('\nSeed completado exitosamente!')
  console.log(`Total de trámites: ${TRAMITES_DISPONIBLES.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
