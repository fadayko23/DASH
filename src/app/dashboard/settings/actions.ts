'use server'

import { getCurrentTenant } from "@/lib/tenant"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateTenant(formData: FormData) {
  const tenant = await getCurrentTenant()
  if (!tenant) throw new Error("No tenant found")

  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  // const logoUrl = formData.get("logoUrl") as string

  if (!name || !slug) {
    throw new Error("Name and Slug are required")
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      name,
      slug,
      // logoUrl
    }
  })

  revalidatePath("/dashboard/settings/tenant")
  
  if (slug !== tenant.slug) {
     // Redirect might be tricky if we are relying on subdomain.
     // For now, just return success, but in real app we'd need to handle redirection.
     // We'll rely on the user to navigate to the new URL if they are using subdomains.
  }
}

export async function updateTheme(formData: FormData) {
    const tenant = await getCurrentTenant()
    if (!tenant) throw new Error("No tenant found")

    const primaryColor = formData.get("primaryColor") as string
    const secondaryColor = formData.get("secondaryColor") as string
    const accentColor = formData.get("accentColor") as string
    const bgColor = formData.get("bgColor") as string
    const textColor = formData.get("textColor") as string
    const borderRadius = formData.get("borderRadius") as string
    
    await prisma.tenantTheme.upsert({
        where: { tenantId: tenant.id },
        create: {
            tenantId: tenant.id,
            primaryColor,
            secondaryColor,
            accentColor,
            bgColor,
            textColor,
            borderRadius,
        },
        update: {
            primaryColor,
            secondaryColor,
            accentColor,
            bgColor,
            textColor,
            borderRadius,
        }
    })

    revalidatePath("/dashboard")
}
