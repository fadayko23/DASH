'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveResponse(projectId: string, questionId: string, answer: string, spaceId?: string) {
    const session = await auth()
    if (!session?.user?.tenantId) throw new Error("Unauthorized")

    // Workaround for composite unique constraint with nullable field (spaceId)
    // We'll verify existence manually first
    const existing = await prisma.questionResponse.findFirst({
        where: {
            projectId,
            questionTemplateId: questionId,
            spaceId: spaceId || null
        }
    })

    if (existing) {
        await prisma.questionResponse.update({
            where: { id: existing.id },
            data: { answerText: answer }
        })
    } else {
        await prisma.questionResponse.create({
            data: {
                projectId,
                questionTemplateId: questionId,
                spaceId: spaceId || null,
                answerText: answer
            }
        })
    }
    
    revalidatePath(`/dashboard/projects/${projectId}`)
}
