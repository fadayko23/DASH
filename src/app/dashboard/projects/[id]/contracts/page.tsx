import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import ContractsClient from "./client"

export default async function ProjectContractsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return <div>Unauthorized</div>
  
  const { id } = await params
  
  const contracts = await prisma.contract.findMany({
      where: { projectId: id },
      include: { amendments: true },
      orderBy: { createdAt: 'desc' }
  })

  const templates = await prisma.contractTemplate.findMany({
      where: { tenantId: session.user.tenantId }
  })

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold">Contracts & Amendments</h2>
            <p className="text-muted-foreground">Manage agreements and scope changes.</p>
        </div>
        <ContractsClient projectId={id} initialContracts={contracts} templates={templates} />
    </div>
  )
}
