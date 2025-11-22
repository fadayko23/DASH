import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
  })

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('password123', 10)
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        hashedPassword,
      },
    })
    console.log('Created user:', user.email)
  } else {
    console.log('User already exists:', existingUser.email)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
