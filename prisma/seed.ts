import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'test@example.com'
  const tenantSlug = 'demo'

  // 1. Upsert User
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Test User',
      hashedPassword,
    },
  })
  console.log('User:', user.email)

  // 2. Upsert Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: {},
    create: {
      name: 'Demo Studio',
      slug: tenantSlug,
    },
  })
  console.log('Tenant:', tenant.name)

  // 3. Upsert UserTenant
  await prisma.userTenant.upsert({
    where: {
      userId_tenantId: {
        userId: user.id,
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      tenantId: tenant.id,
      role: 'owner',
    },
  })
  console.log('UserTenant: Linked')

  // 4. Upsert Theme
  await prisma.tenantTheme.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      primaryColor: '#3b82f6', // Blue 500
      secondaryColor: '#f1f5f9', // Slate 100
      accentColor: '#f1f5f9',
      bgColor: '#ffffff',
      textColor: '#171717',
    },
  })
  console.log('TenantTheme: Created')
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
