const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding: creating user, wedding, guests...')

  const user = await prisma.user.create({
    data: {
      name: 'Priya & Kasun',
      email: 'hello@priyakasun.com',
      role: 'COUPLE'
    }
  })

  const wedding = await prisma.wedding.create({
    data: {
      userId: user.id,
      groomFirstName: 'Kasun',
      brideFirstName: 'Priya',
      slug: 'priya-and-kasun',
      eventDate: new Date('2026-08-15T16:00:00Z'),
      venueName: 'Galle Face Hotel, Colombo',
      setupCompleted: true,
      estimatedGuests: 150
    }
  })

  await prisma.guest.createMany({
    data: [
      { weddingId: wedding.id, name: 'Nimal Perera', side: 'GROOM', invitationType: 'INDIVIDUAL' },
      { weddingId: wedding.id, name: 'Fernando Family', side: 'BRIDE', invitationType: 'FAMILY', maxAllowedMembers: 4 }
    ]
  })

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
