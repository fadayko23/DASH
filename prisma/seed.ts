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
  
  // Categories & Types
  const catFurniture = await prisma.productCategory.create({ data: { name: 'Furniture' } })
  const typeSofa = await prisma.productType.create({ data: { name: 'Sofa', categoryId: catFurniture.id } })
  const typeChair = await prisma.productType.create({ data: { name: 'Chair', categoryId: catFurniture.id } })
  
  // Vendors
  const vendorHerman = await prisma.vendor.create({ data: { name: 'Herman Miller', website: 'https://hermanmiller.com' } })
  const vendorIkea = await prisma.vendor.create({ data: { name: 'IKEA', website: 'https://ikea.com' } })

  // Products (Global)
  const productEames = await prisma.product.create({
      data: {
          name: 'Eames Lounge Chair',
          baseSku: 'HM-EAMES-001',
          vendorId: vendorHerman.id,
          productTypeId: typeChair.id,
          scope: 'global',
          status: 'active',
      }
  })
  console.log('Product Created:', productEames.name)

  await prisma.productVariant.create({
      data: {
          productId: productEames.id,
          name: 'Walnut / Black Leather',
          variantSku: 'HM-EAMES-001-WB',
          attributesJson: { finish: 'Walnut', upholstery: 'Black Leather' }
      }
  })

  const productKlippan = await prisma.product.create({
      data: {
          name: 'Klippan Loveseat',
          baseSku: 'IK-KLIP-001',
          vendorId: vendorIkea.id,
          productTypeId: typeSofa.id,
          scope: 'global',
          status: 'active',
      }
  })
  console.log('Product Created:', productKlippan.name)

   // Tenant Product (Custom)
   const productCustomSofa = await prisma.product.create({
       data: {
           name: 'Custom Studio Sofa',
           baseSku: 'CUST-001',
           productTypeId: typeSofa.id,
           scope: 'tenant',
           ownerTenantId: tenant.id,
           status: 'active',
       }
   })
   console.log('Tenant Product Created:', productCustomSofa.name)

   // Override (Tenant specific pricing for global product)
   await prisma.tenantProductOverride.create({
       data: {
           tenantId: tenant.id,
           productId: productEames.id,
           costPrice: 4500.00,
           sellPrice: 6500.00,
           internalNotes: 'High margin item',
           availability: 'preferred'
       }
   })
   console.log('Override Created for:', productEames.name)
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
