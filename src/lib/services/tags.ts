import { prisma } from "@/lib/prisma"

export async function checkTagConflicts(projectId: string, projectTag: string | null) {
  if (!projectTag) return

  // 1. Find all products in this project with the same tag
  const taggedProducts = await prisma.projectProduct.findMany({
      where: { projectId, projectTag },
      select: { id: true, productId: true }
  })

  // 2. Check for distinct product IDs (ignoring variants for now, assuming tag implies same base product family? 
  // Or usually tag = unique item. If multiple products share tag, it's a conflict unless they are the SAME product.)
  const distinctProductIds = new Set(taggedProducts.map(p => p.productId))
  const hasConflict = distinctProductIds.size > 1

  // 3. Update conflict status
  if (taggedProducts.length > 0) {
      await prisma.projectProduct.updateMany({
          where: { id: { in: taggedProducts.map(p => p.id) } },
          data: { tagConflict: hasConflict }
      })
  }
}
