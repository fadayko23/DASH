import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import ChatClient from "./client"

export default async function MessagesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user) return <div>Unauthorized</div>

  const { projectId } = await params
  const messages = await prisma.projectMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
  })

  return (
    <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <div className="bg-white rounded-lg border shadow-sm h-[600px] flex flex-col">
            <ChatClient projectId={projectId} initialMessages={messages} senderType="client" />
        </div>
    </div>
  )
}
