import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StatusBadge } from "@/components/ui/status-badge"
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaExternalLinkAlt, FaBuilding } from "react-icons/fa"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return <div>Unauthorized</div>
  
  const { id } = await params
  const client = await prisma.client.findUnique({
      where: { id },
      include: { 
          projects: true
      }
  })

  if (!client) return notFound()

  const [firstName, ...lastNameParts] = client.name.split(' ')
  const lastName = lastNameParts.join(' ')

  return (
    <div className="h-full flex flex-col bg-muted/10">
        {/* Sticky Header */}
        <header className="bg-background border-b sticky top-0 z-10 px-8 py-4 flex justify-between items-center shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            </div>
            <div className="flex items-center gap-2">
                 <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
                    Send IDSQ
                 </button>
            </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Main Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
                        <h2 className="text-lg font-semibold border-b pb-2">Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client First Name</label>
                                <div className="mt-1 p-2 border rounded-md bg-background text-sm">{firstName}</div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Last Name</label>
                                <div className="mt-1 p-2 border rounded-md bg-background text-sm">{lastName}</div>
                            </div>
                             <div className="col-span-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Full Name</label>
                                <div className="mt-1 p-2 border rounded-md bg-background text-sm">{client.name}</div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Email</label>
                                <a href={`mailto:${client.email}`} className="block mt-1 p-2 border rounded-md bg-background text-sm text-blue-600 hover:underline">{client.email || '-'}</a>
                            </div>
                             <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Phone</label>
                                <div className="mt-1 p-2 border rounded-md bg-background text-sm">{client.phone || '-'}</div>
                            </div>
                        </div>
                    </div>

                     <div className="space-y-8">
                        {/* Additional Details */}
                        <div className="bg-card rounded-xl border shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Additional Details</h2>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Additional Notes</label>
                                <textarea 
                                    className="w-full min-h-[100px] p-3 rounded-md border bg-muted/10 focus:bg-background text-sm resize-none"
                                    defaultValue={client.notes || ''}
                                    placeholder="No notes added."
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Billing Details */}
                <div className="bg-card rounded-xl border shadow-sm p-6 relative">
                    <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h2 className="text-lg font-semibold">Billing Details</h2>
                        <button className="text-xs bg-foreground text-background px-3 py-1 rounded-md flex items-center gap-1">
                            Google Maps <FaExternalLinkAlt size={10} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Billing Complete Address</label>
                            <div className="mt-1 p-2 border rounded-md bg-background text-sm">{client.primaryAddress || '-'}</div>
                        </div>
                        <div>
                             <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Billing Street Address</label>
                             <div className="mt-1 p-2 border rounded-md bg-background text-sm">{client.primaryAddress?.split(',')[0] || '-'}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">City</label>
                                 <div className="mt-1 p-2 border rounded-md bg-background text-sm">{client.primaryAddress?.split(',')[1]?.trim() || '-'}</div>
                            </div>
                            <div>
                                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">State</label>
                                 <div className="mt-1 p-2 border rounded-md bg-background text-sm flex justify-between items-center">
                                    Arizona <FaBuilding className="text-muted-foreground opacity-50" />
                                 </div>
                            </div>
                            <div>
                                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Zip</label>
                                 <div className="mt-1 p-2 border rounded-md bg-background text-sm">{client.primaryAddress?.split(',')[2]?.trim().split(' ')[1] || '-'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Linked Projects */}
                <div className="bg-card rounded-xl border shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-6 border-b pb-2">Project Details</h2>
                    <div className="grid gap-4">
                        {client.projects.map(project => (
                            <Link href={`/dashboard/projects/${project.id}`} key={project.id} className="flex border rounded-lg overflow-hidden hover:border-primary transition-colors">
                                <div className="w-48 bg-muted flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: project.mainImageUrl ? `url(${project.mainImageUrl})` : undefined }}>
                                    {!project.mainImageUrl && <div className="h-full flex items-center justify-center text-muted-foreground"><FaBuilding size={24} /></div>}
                                </div>
                                <div className="p-4 flex-1 grid grid-cols-4 gap-4 items-center">
                                    <div className="col-span-2">
                                        <div className="font-bold text-lg">{project.name}</div>
                                        <div className="text-sm text-muted-foreground">{project.phase || 'Design Oversight'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Contract Type</div>
                                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs inline-block font-medium">Residential</div>
                                    </div>
                                    <div>
                                         <StatusBadge status={project.status} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {client.projects.length === 0 && (
                            <div className="text-muted-foreground text-sm py-4">No projects linked to this client.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    </div>
  )
}

