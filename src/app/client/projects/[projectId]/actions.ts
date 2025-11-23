'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function updateSelectionStatus(selectionId: string, status: 'approved' | 'declined') {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    await prisma.projectProduct.update({
        where: { id: selectionId },
        data: { clientStatus: status }
    })
}
