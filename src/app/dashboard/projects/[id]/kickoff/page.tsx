import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import QuestionListClient from "../discover/client"

export default async function KickoffPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return <div>Unauthorized</div>
  
  const { id } = await params
  
  // Group questions by Room Type (or general)
  // 1. General Kickoff Questions
  const generalQuestions = await prisma.questionTemplate.findMany({
      where: { tenantId: session.user.tenantId, scope: 'kickoff', roomTypeId: null },
      orderBy: { order: 'asc' }
  })

  // 2. Fetch spaces
  const spaces = await prisma.space.findMany({
      where: { projectId: id },
      include: { roomType: true }
  })

  // 3. Fetch room-specific questions
  // Ideally we fetch all kickoff questions and filter in JS to avoid N+1 queries if many room types
  const allKickoffQuestions = await prisma.questionTemplate.findMany({
      where: { tenantId: session.user.tenantId, scope: 'kickoff' }
  })

  const responses = await prisma.questionResponse.findMany({
      where: { projectId: id }
  })

  return (
    <div className="space-y-12">
        <div>
            <h2 className="text-2xl font-bold">Kickoff Phase</h2>
            <p className="text-muted-foreground">Detailed requirements for general project and specific spaces.</p>
        </div>

        {/* General Questions */}
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">General Requirements</h3>
            <QuestionListClient 
                projectId={id} 
                questions={generalQuestions} 
                initialResponses={responses.filter(r => !r.spaceId)} 
            />
        </div>

        {/* Per-Space Questions */}
        <div className="space-y-8">
            <h3 className="text-xl font-semibold border-b pb-2">Space-Specific Requirements</h3>
            {spaces.map(space => {
                const spaceQuestions = allKickoffQuestions.filter(q => q.roomTypeId === space.roomTypeId)
                if (spaceQuestions.length === 0) return null

                return (
                    <div key={space.id} className="space-y-4 p-4 border rounded-lg bg-card/50">
                        <h4 className="font-medium text-lg">{space.name} <span className="text-muted-foreground text-sm">({space.roomType?.name || 'General'})</span></h4>
                        <QuestionListClient 
                            projectId={id} 
                            questions={spaceQuestions} 
                            initialResponses={responses.filter(r => r.spaceId === space.id)}
                            spaceId={space.id}
                        />
                    </div>
                )
            })}
            {spaces.length === 0 && <p className="text-muted-foreground italic">No spaces added yet. Add spaces to see specific questions.</p>}
        </div>
    </div>
  )
}
