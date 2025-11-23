import { PrismaClient, UserRole, ProductScope } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const DEMO_TENANT_SLUG = process.env.DEMO_TENANT_SLUG || 'demo'

async function main() {
  console.log('🌱 Starting Demo Seed...')

  // 1. Create or Update Demo Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: DEMO_TENANT_SLUG },
    update: {},
    create: {
      name: 'Wonderland Studios',
      slug: DEMO_TENANT_SLUG,
      logoUrl: 'https://placehold.co/400x100/3b82f6/ffffff?text=Wonderland+Studios',
    },
  })

  console.log(`✅ Tenant: ${tenant.name}`)

  // 2. Tenant Theme
  await prisma.tenantTheme.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      primaryColor: '#8b5cf6', // Violet
      secondaryColor: '#f3f4f6',
      accentColor: '#c4b5fd',
      bgColor: '#ffffff',
      textColor: '#1e293b',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '0.75rem',
    },
  })

  // 3. Users
  const password = await hash('demo123', 10)
  
  // Owner
  const owner = await prisma.user.upsert({
    where: { email: 'alice@wonderland.com' },
    update: {},
    create: {
      name: 'Alice Liddell',
      email: 'alice@wonderland.com',
      hashedPassword: password,
    },
  })
  
  await prisma.userTenant.upsert({
    where: { userId_tenantId: { userId: owner.id, tenantId: tenant.id } },
    update: {},
    create: { userId: owner.id, tenantId: tenant.id, role: UserRole.owner },
  })

  // Designer
  const designer = await prisma.user.upsert({
    where: { email: 'hatter@wonderland.com' },
    update: {},
    create: {
      name: 'Mad Hatter',
      email: 'hatter@wonderland.com',
      hashedPassword: password,
    },
  })

  await prisma.userTenant.upsert({
    where: { userId_tenantId: { userId: designer.id, tenantId: tenant.id } },
    update: {},
    create: { userId: designer.id, tenantId: tenant.id, role: UserRole.designer },
  })

  console.log('✅ Users seeded')

  // 4. Clients
  const client1 = await prisma.client.create({
    data: {
      tenantId: tenant.id,
      name: 'Tony Stark',
      email: 'tony@starkindustries.com',
      phone: '555-0199',
      primaryAddress: '10880 Malibu Point, Malibu, CA 90265',
      notes: 'Loves high-tech gadgets and modern aesthetics.',
    }
  })

  // Client User
  const clientUser = await prisma.user.upsert({
    where: { email: 'tony@starkindustries.com' },
    update: {},
    create: {
      name: 'Tony Stark',
      email: 'tony@starkindustries.com',
      hashedPassword: password,
      clientId: client1.id
    },
  })
  await prisma.userTenant.upsert({
    where: { userId_tenantId: { userId: clientUser.id, tenantId: tenant.id } },
    update: {},
    create: { userId: clientUser.id, tenantId: tenant.id, role: UserRole.client },
  })

  // 5. Projects
  const project = await prisma.project.create({
    data: {
      tenantId: tenant.id,
      clientId: client1.id,
      name: 'Malibu Mansion Reno',
      description: 'Complete overhaul of the cliffside living room and lab area.',
      type: 'residential',
      status: 'active',
      phase: 'Design Development',
      projectAddress: '10880 Malibu Point, Malibu, CA 90265',
      projectLat: 34.0259,
      projectLng: -118.7798,
      propertyMetadataJson: { beds: 5, baths: 6, sqft: 8500 },
      mainImageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop'
    }
  })

  console.log('✅ Projects seeded')

  // 6. Spaces
  const livingRoom = await prisma.space.create({
    data: {
      projectId: project.id,
      name: 'Living Room',
      floor: '1st Floor',
      notes: 'Focus on ocean views.'
    }
  })

  const lab = await prisma.space.create({
    data: {
      projectId: project.id,
      name: 'The Lab',
      floor: 'Basement',
      notes: 'Industrial style, durable materials.'
    }
  })

  // 7. Products & Specs
  // Ensure Vendor exists
  const vendor = await prisma.vendor.create({
    data: { name: 'Stark Furnishings' }
  })

  const furnitureCategory = await prisma.productCategory.create({
    data: { name: 'Furniture' }
  })

  const sofaType = await prisma.productType.create({
    data: {
      name: 'Sofa',
      categoryId: furnitureCategory.id
    }
  })

  const sofa = await prisma.product.create({
    data: {
      name: 'Arc Reactor Sofa',
      scope: ProductScope.tenant,
      ownerTenantId: tenant.id,
      vendorId: vendor.id,
      productTypeId: sofaType.id,
      status: 'active',
      description: 'Glowing blue cushions.',
      media: {
          create: { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop' }
      }
    }
  })

  await prisma.projectProduct.create({
    data: {
      projectId: project.id,
      spaceId: livingRoom.id,
      productId: sofa.id,
      elementKey: 'sofa',
      elementLabel: 'Sectional Sofa',
      quantity: 1,
      projectTag: 'FUR-01',
      clientStatus: 'approved',
      visibleToClient: true
    }
  })

  // 8. Tasks & Milestones
  await prisma.task.createMany({
    data: [
      { tenantId: tenant.id, projectId: project.id, title: 'Order Sofa', status: 'todo', assigneeUserId: designer.id },
      { tenantId: tenant.id, projectId: project.id, title: 'Measure Windows', status: 'done', assigneeUserId: owner.id },
    ]
  })

  await prisma.projectMilestone.create({
    data: {
      tenantId: tenant.id,
      projectId: project.id,
      name: 'Concept Approval',
      targetDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      amount: 5000,
    }
  })

  // 9. Contracts
  const template = await prisma.contractTemplate.create({
    data: {
      tenantId: tenant.id,
      name: 'Standard Design Agreement',
      type: 'client',
      body: '<h1>Design Agreement</h1><p>This agreement is between Wonderland Studios and {{clientName}}...</p>'
    }
  })

  await prisma.contract.create({
    data: {
      tenantId: tenant.id,
      projectId: project.id,
      templateId: template.id,
      title: 'Initial Engagement',
      status: 'sent',
      billingModel: 'flat_rate',
      baseFlatAmount: 15000
    }
  })

  console.log('🎉 Demo Seed Complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
