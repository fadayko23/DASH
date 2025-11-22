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
      primaryColor: '#3b82f6',
      secondaryColor: '#f1f5f9',
      accentColor: '#f1f5f9',
      bgColor: '#ffffff',
      textColor: '#171717',
    },
  })
  console.log('TenantTheme: Created')

  // 5. Catalog Seeds
  // ... (previous catalog seeds omitted for brevity but would exist in real file) ...

  // 6. Phase 5 Seeds: Locations, Steps, Questions, Intake
  
  // Steps
  const steps = [
      { key: 'discover', displayName: 'Discover', order: 1 },
      { key: 'kickoff', displayName: 'Kickoff', order: 2 },
      { key: 'concept', displayName: 'Concept', order: 3 },
      { key: 'design', displayName: 'Design', order: 4 },
      { key: 'sourcing', displayName: 'Sourcing', order: 5 },
      { key: 'procurement', displayName: 'Procurement', order: 6 },
      { key: 'install', displayName: 'Installation', order: 7 },
      { key: 'closeout', displayName: 'Closeout', order: 8 },
  ]

  for (const step of steps) {
      await prisma.stepTemplate.create({
          data: {
              tenantId: tenant.id,
              ...step
          }
      })
  }
  console.log('StepTemplates: Created 8 steps')

  // Questions
  await prisma.questionTemplate.create({
      data: {
          tenantId: tenant.id,
          scope: 'discover',
          prompt: 'What is your estimated budget for this project?',
          helperText: 'Include furniture, labor, and contingency.',
          order: 1
      }
  })
  await prisma.questionTemplate.create({
      data: {
          tenantId: tenant.id,
          scope: 'discover',
          prompt: 'Do you have any "must-keep" items?',
          order: 2
      }
  })
  await prisma.questionTemplate.create({
      data: {
          tenantId: tenant.id,
          scope: 'kickoff',
          prompt: 'Confirm ceiling height and electrical outlet locations.',
          order: 1
      }
  })
  console.log('QuestionTemplates: Created sample questions')

  // Intake Form
  const intake = await prisma.intakeForm.create({
      data: {
          tenantId: tenant.id,
          name: 'New Project Inquiry',
          slug: 'inquiry',
          configJson: { fields: ['name', 'email', 'phone', 'address'] }
      }
  })
  console.log('IntakeForm: Created', intake.slug)

  // Tenant Location
  await prisma.tenantLocation.create({
      data: {
          tenantId: tenant.id,
          name: 'Main Studio',
          address: '123 Design Blvd, Los Angeles, CA 90012',
          lat: 34.0522,
          lng: -118.2437,
          isPrimary: true
      }
  })
  console.log('TenantLocation: Created')
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
