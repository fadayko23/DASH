import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StatusBadge } from "@/components/ui/status-badge"
import { ProjectStatusToggles } from "@/components/project-status-toggles"
import { FaClock, FaExternalLinkAlt, FaEllipsisH, FaRegImage, FaMapMarkerAlt } from "react-icons/fa"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return <div>Unauthorized</div>
  
  const { id } = await params
  const project = await prisma.project.findUnique({
      where: { id },
      include: { 
          client: true,
          stepStatuses: true,
          contracts: { include: { amendments: true } },
          timeEntries: true
      }
  })

  if (!project) return notFound()

  // Calculate Hours
  const totalAllocatedHours = project.contracts.reduce((sum, c) => {
      const base = c.baseHoursAllocated ? Number(c.baseHoursAllocated) : 0
      const amendments = c.amendments.reduce((aSum, a) => aSum + (a.extraHoursAllocated ? Number(a.extraHoursAllocated) : 0), 0)
      return sum + base + amendments
  }, 0)
  
  const totalUsedHours = project.timeEntries.reduce((sum, t) => sum + Number(t.hours), 0)
  const remainingHours = totalAllocatedHours - totalUsedHours

  // Prepare Steps
  const stepTemplates = await prisma.stepTemplate.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { order: 'asc' }
  })
  const steps = stepTemplates.map(template => {
      const status = project.stepStatuses.find(s => s.stepKey === template.key)?.status || 'not_started'
      return { key: template.key, displayName: template.displayName, status }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = (project.propertyMetadataJson as any) || {}

  return (
    <div className="h-full flex flex-col bg-muted/10">
        {/* Sticky Header */}
        <header className="bg-background border-b sticky top-0 z-10 px-8 py-4 flex justify-between items-center shadow-sm">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                    <StatusBadge status={project.status} className="px-3 py-1 text-sm" />
                </div>
                <div className="flex items-center text-muted-foreground text-sm gap-2">
                    <FaMapMarkerAlt /> {project.projectAddress || 'No address set'}
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <button className="p-2 hover:bg-accent rounded-md border bg-background text-muted-foreground">
                    <FaEllipsisH />
                 </button>
                 <Link href={`/dashboard/projects/${id}/selections`} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
                    <FaRegImage /> Photos
                 </Link>
            </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Project Details Section */}
                    <section className="bg-card rounded-xl border shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-6">Project Details</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Address */}
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Project Complete Address</label>
                                <div className="mt-1 p-3 bg-muted/20 rounded-md border border-transparent hover:border-border transition-colors">
                                    {project.projectAddress || '—'}
                                </div>
                            </div>

                            {/* Phase & Status */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Project Phase</label>
                                <div className="mt-1">
                                     <div className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 px-3 py-1.5 rounded-md inline-block text-sm font-medium">
                                        {project.phase || 'Design Oversight'}
                                     </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Project Status</label>
                                <div className="mt-1">
                                     <StatusBadge status={project.status} />
                                </div>
                            </div>

                            {/* Dates & Contract */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Project Start Date</label>
                                <div className="mt-1 p-2 border rounded-md bg-background text-sm">
                                    {new Date(project.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                             <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contract Type</label>
                                <div className="mt-1 p-2 border rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm">
                                    {project.contracts[0]?.billingModel || 'Residential'}
                                </div>
                            </div>

                             {/* Budget & Timeline */}
                             <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Project Ideal Budget</label>
                                <div className="mt-1 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium inline-block px-4">
                                    {meta.idealBudget || '$1 Million - $1.25 Million'}
                                </div>
                            </div>
                             <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Project Ideal Timeline</label>
                                <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium inline-block px-4">
                                    {meta.timeline || '3 - 6 (Months)'}
                                </div>
                            </div>
                            
                            <div className="col-span-2 flex items-center gap-2 pt-2">
                                <input type="checkbox" id="override" className="rounded border-gray-300" />
                                <label htmlFor="override" className="text-sm font-medium">Override Project Details</label>
                            </div>

                        </div>
                    </section>

                    {/* Additional Notes */}
                    <section className="bg-card rounded-xl border shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Project Additional Notes</h2>
                        <textarea 
                            className="w-full min-h-[150px] p-4 rounded-md border bg-muted/10 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                            placeholder="Add notes here..."
                            defaultValue={project.description || ''}
                        />
                    </section>

                </div>

                {/* Right Column - Tracking & Widgets */}
                <div className="space-y-8">
                    
                    {/* Status Tracking */}
                    <div className="bg-card rounded-xl border shadow-sm p-6">
                        <ProjectStatusToggles projectId={id} steps={steps.length ? steps : [
                            { key: 'discovery', displayName: 'Has the Discovery Call been completed?', status: 'complete' },
                            { key: 'site_visit', displayName: 'Has the Site Visit been completed?', status: 'complete' },
                            { key: 'contract', displayName: 'Has the contract been sent to the client?', status: 'complete' }
                        ]} />
                         <div className="mt-6 pt-4 border-t flex items-center gap-2 text-sm">
                            <input type="checkbox" id="show-times" className="rounded border-gray-300" />
                            <label htmlFor="show-times" className="text-muted-foreground">Would you like to show last updated timeframes?</label>
                        </div>
                    </div>

                    {/* Time Tracking Widget */}
                    <div className="bg-card rounded-xl border shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Time Tracking</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Hours Remaining</div>
                                <div className="text-4xl font-bold tracking-tight">{remainingHours.toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground mt-1">Remaining hours allocated to the project.</div>
                            </div>
                            
                            <div className="pt-4 border-t">
                                <div className="text-sm font-medium mb-1">Last Updated</div>
                                <div className="text-sm text-muted-foreground">
                                    Time and date when the project hours were last updated.
                                </div>
                                <div className="mt-2 text-sm font-mono bg-muted/30 p-2 rounded">
                                    June 2, 2025 4:39pm
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
  )
}
