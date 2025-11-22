import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import QuestionListClient from "./client"

export default async function DiscoverPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return <div>Unauthorized</div>
  
  const { id } = await params
  
  const questions = await prisma.questionTemplate.findMany({
      where: { tenantId: session.user.tenantId, scope: 'discover' },
      orderBy: { order: 'asc' }
  })

  const responses = await prisma.questionResponse.findMany({
      where: { projectId: id, spaceId: null }
  })

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">Discover Phase</h2>
        <p className="text-muted-foreground">Capture high-level project requirements and style preferences.</p>
        <QuestionListClient 
            projectId={id} 
            questions={questions} 
            initialResponses={responses} 
        />
    </div>
  )
}
