import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import ProductDetailClient from "./client"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const tenantId = session?.user?.tenantId
  const { id } = await params

  if (!tenantId) return <div>Unauthorized</div>

  const product = await prisma.product.findUnique({
      where: { id },
      include: {
          vendor: true,
          productType: { include: { category: true } },
          variants: true,
          media: true,
          overrides: {
              where: { tenantId, variantId: null } // Base overrides
          }
      }
  })

  if (!product) return <div>Product not found</div>

  // Transform for client
  const override = product.overrides[0] || {}
  const productWithOverride = {
      ...product,
      overrides: undefined,
      userPrice: override.sellPrice?.toString() || '',
      userCost: override.costPrice?.toString() || '',
      userMarkup: override.markupPercent?.toString() || '',
      userNotes: override.internalNotes || '',
      userAvailability: override.availability || 'default'
  }

  return <ProductDetailClient product={productWithOverride} />
}
