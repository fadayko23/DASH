import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import ClientSelections from "./selections"

export default async function ClientProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user) return <div>Unauthorized</div>

  const { projectId } = await params
  const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
          spaces: true
      }
  })

  if (!project) return <div>Project not found</div>

  // Fetch visible selections
  const selections = await prisma.projectProduct.findMany({
      where: { 
          projectId,
          visibleToClient: true 
      },
      include: {
          product: { include: { media: true, vendor: true } },
          variant: true,
          space: true
      }
  })

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500">{project.description}</p>
        </div>

        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Selections for Approval</h2>
            <ClientSelections selections={selections} spaces={project.spaces} />
        </div>
    </div>
  )
}
