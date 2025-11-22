import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import ClientSelections from "./selections"
import { FaCreditCard, FaCheckCircle } from "react-icons/fa"

export default async function ClientProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user) return <div>Unauthorized</div>

  const { projectId } = await params
  const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
          spaces: true,
          milestones: {
              orderBy: { targetDate: 'asc' },
              include: {
                  paymentRecords: true
              }
          }
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

        {/* Milestones / Billing Overview for Client */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Project Milestones</h2>
            <div className="space-y-4">
                {project.milestones.map((m) => {
                    const amount = Number(m.amount) || 0
                    const paid = m.paymentRecords.some(p => p.status === 'succeeded')
                    
                    return (
                        <div key={m.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                            <div>
                                <h3 className="font-medium">{m.name}</h3>
                                {m.targetDate && (
                                    <p className="text-sm text-gray-500">Target: {m.targetDate.toLocaleDateString()}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold">${amount.toLocaleString()}</span>
                                {amount > 0 && (
                                    paid ? (
                                        <span className="flex items-center gap-2 text-green-600 text-sm font-medium px-3 py-1 bg-green-50 rounded-full">
                                            <FaCheckCircle /> Paid
                                        </span>
                                    ) : (
                                        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                                            <FaCreditCard /> Pay Now
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    )
                })}
                {project.milestones.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No milestones created yet.</p>
                )}
            </div>
        </div>

        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Selections for Approval</h2>
            <ClientSelections selections={selections} spaces={project.spaces} />
        </div>
    </div>
  )
}
