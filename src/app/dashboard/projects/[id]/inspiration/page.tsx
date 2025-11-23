import { auth } from "@/auth"
import ProjectInspirationClient from "./client"

export default async function ProjectInspirationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return <div>Unauthorized</div>
  
  const { id } = await params
  
  // We'll fetch data in client component for simpler interactivity in this MVP phase
  // or pass initial data. Let's pass initial data if possible, but client fetching is fine for "Add from Library" modal.

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold">Inspiration & Mood Boards</h2>
            <p className="text-muted-foreground">Manage visual direction and share with client.</p>
        </div>
        <ProjectInspirationClient projectId={id} />
    </div>
  )
}
