import { prisma } from "@/lib/prisma"

export async function onPhaseChange(projectId: string, phaseName: string) {
  const project = await prisma.project.findUnique({ 
      where: { id: projectId },
      include: { tenant: true }
  })
  if (!project) return

  // Find the phase definition for this tenant
  const phase = await prisma.projectPhase.findFirst({
      where: { 
          tenantId: project.tenantId,
          name: { equals: phaseName, mode: 'insensitive' }
      },
      include: { taskTemplates: true }
  })

  if (!phase || !phase.taskTemplates.length) return

  // Create tasks if they don't exist
  for (const template of phase.taskTemplates) {
      // Check duplicate task for this project by title? Or maybe we assume tasks can be duplicated.
      // For automation, we usually prevent re-creating same task if it exists in "todo" state.
      const existing = await prisma.task.findFirst({
          where: {
              projectId,
              title: template.title
          }
      })

      if (!existing) {
          let dueDate = null
          if (template.relativeDueDays) {
              dueDate = new Date()
              dueDate.setDate(dueDate.getDate() + template.relativeDueDays)
          }

          await prisma.task.create({
              data: {
                  tenantId: project.tenantId,
                  projectId,
                  title: template.title,
                  description: template.description,
                  dueDate,
                  status: 'todo'
              }
          })
      }
  }
}
