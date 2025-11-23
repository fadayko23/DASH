import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function ClientDashboard() {
  const session = await auth()
  if (!session?.user) return <div>Unauthorized</div>

  // Find client record associated with user
  // In real app, we'd link user.clientId. For now, assume we find by email if clientId is null
  
  const user = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      include: { client: true }
  })

  const clientEmail = user?.email

  const projects = await prisma.project.findMany({
      where: { 
          OR: [
              { clientId: user?.clientId || 'missing' },
              { client: { email: clientEmail } }
          ]
      },
      orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
                <Link key={project.id} href={`/client/projects/${project.id}`} className="block p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 capitalize">{project.status.replace('_', ' ')}</p>
                    <div className="mt-4 text-sm text-blue-600 font-medium">View Details &rarr;</div>
                </Link>
            ))}
            {projects.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-12">
                    No projects found associated with your account.
                </div>
            )}
        </div>
    </div>
  )
}
