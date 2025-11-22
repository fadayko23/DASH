import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { FaGoogle, FaCheckCircle } from "react-icons/fa"

export default async function IntegrationsPage() {
  const session = await auth()
  if (!session?.user?.tenantId) return <div>Unauthorized</div>

  const connection = await prisma.tenantGoogleConnection.findUnique({
      where: { tenantId: session.user.tenantId }
  })

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold">Integrations</h1>
        
        <div className="p-6 border rounded-lg bg-card flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-full shadow-sm border">
                    <FaGoogle className="text-2xl text-red-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Google Workspace</h3>
                    <p className="text-sm text-muted-foreground">
                        Connect your calendar and email for scheduling and communication.
                    </p>
                    {connection && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-green-600 font-medium">
                            <FaCheckCircle /> Connected as {connection.accountEmail}
                        </div>
                    )}
                </div>
            </div>
            
            <div>
                {connection ? (
                    <button disabled className="px-4 py-2 bg-muted text-muted-foreground rounded-md cursor-not-allowed">
                        Connected
                    </button>
                ) : (
                    <Link 
                        href="/api/integrations/google/connect"
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Connect
                    </Link>
                )}
            </div>
        </div>
    </div>
  )
}
