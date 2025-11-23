'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateStepStatus(projectId: string, stepKey: string, status: 'not_started' | 'in_progress' | 'complete') {
    const session = await auth()
    if (!session?.user?.tenantId) throw new Error("Unauthorized")

    await prisma.projectStepStatus.upsert({
        where: {
            projectId_stepKey: {
                projectId,
                stepKey
            }
        },
        create: {
            projectId,
            stepKey,
            status,
            completedAt: status === 'complete' ? new Date() : null
        },
        update: {
            status,
            completedAt: status === 'complete' ? new Date() : null
        }
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
}
