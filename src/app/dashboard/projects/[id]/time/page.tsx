import { auth } from "@/auth"
import TimeTrackingClient from "./client"

export default async function TimeTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return <div>Unauthorized</div>
  
  const { id } = await params
  
  // Initial fetch handled in client for simplicity or pass here
  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold">Time Tracking</h2>
            <p className="text-muted-foreground">Log hours against contracts and amendments.</p>
        </div>
        <TimeTrackingClient projectId={id} />
    </div>
  )
}
