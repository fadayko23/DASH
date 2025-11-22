import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaHome } from "react-icons/fa"
import SpacesList from "./spaces-list"
import ProjectTracker from "./tracker"
import ScheduleMeeting from "./scheduler"
import Link from "next/link"
import ProjectTasks from "./tasks"
import ProjectMilestones from "./milestones"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return <div>Unauthorized</div>
  
  const { id } = await params
  const project = await prisma.project.findUnique({
      where: { id },
      include: { 
          client: true,
          stepStatuses: true
      }
  })

  if (!project) return <div>Project not found</div>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const propertyMeta = project.propertyMetadataJson as any || {}

  // Fetch step templates for the tracker
  const stepTemplates = await prisma.stepTemplate.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { order: 'asc' }
  })

  // Merge statuses
  const steps = stepTemplates.map(template => {
      const status = project.stepStatuses.find(s => s.stepKey === template.key)?.status || 'not_started'
      return {
          key: template.key,
          displayName: template.displayName,
          status
      }
  })

  return (
    <div className="space-y-8">
        {/* Header & Tracker */}
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <Link href="/dashboard/projects" className="text-sm text-muted-foreground hover:text-foreground mb-2 block">&larr; Back to Projects</Link>
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground">{project.client.name} • <span className="capitalize">{project.status.replace('_', ' ')}</span></p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/projects/${id}/discover`} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 text-sm font-medium">
                        Discover
                    </Link>
                    <Link href={`/dashboard/projects/${id}/kickoff`} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 text-sm font-medium">
                        Kickoff
                    </Link>
                </div>
            </div>
            
            {/* Tracker */}
            {steps.length > 0 && (
                <div className="p-4 border rounded-lg bg-card/50">
                    <ProjectTracker projectId={id} steps={steps} />
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Info & Property Card */}
            <div className="md:col-span-2 space-y-6">
                <ScheduleMeeting projectId={id} />
                
                {/* Property Card */}
                <div className="rounded-lg border bg-card overflow-hidden">
                    {project.mainImageUrl && (
                        <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${project.mainImageUrl})` }} />
                    )}
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <FaHome className="text-primary"/> Property Details
                        </h3>
                        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                            <FaMapMarkerAlt /> {project.projectAddress || 'No address listed'}
                        </div>
                        
                        {/* Enriched Data Grid */}
                        {project.projectAddress && (
                            <div className="grid grid-cols-3 gap-4 border-t pt-4">
                                <div className="flex flex-col items-center p-2 bg-muted/30 rounded">
                                    <FaBed className="text-muted-foreground mb-1"/>
                                    <span className="font-bold">{propertyMeta.beds || '-'}</span>
                                    <span className="text-xs text-muted-foreground">Beds</span>
                                </div>
                                <div className="flex flex-col items-center p-2 bg-muted/30 rounded">
                                    <FaBath className="text-muted-foreground mb-1"/>
                                    <span className="font-bold">{propertyMeta.baths || '-'}</span>
                                    <span className="text-xs text-muted-foreground">Baths</span>
                                </div>
                                <div className="flex flex-col items-center p-2 bg-muted/30 rounded">
                                    <FaRulerCombined className="text-muted-foreground mb-1"/>
                                    <span className="font-bold">{propertyMeta.sqft || '-'}</span>
                                    <span className="text-xs text-muted-foreground">Sq Ft</span>
                                </div>
                            </div>
                        )}
                        {project.projectLat && (
                            <div className="mt-4 text-xs text-muted-foreground">
                                Coordinates: {project.projectLat.toFixed(4)}, {project.projectLng?.toFixed(4)}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Spaces Section */}
                <SpacesList projectId={project.id} />
            </div>

            {/* Sidebar / Meta */}
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <Link href={`/dashboard/projects/${id}/contracts`} className="bg-card border p-4 rounded-lg text-center hover:border-primary transition-colors">
                        <span className="block font-semibold">Contracts</span>
                        <span className="text-xs text-muted-foreground">Manage agreements</span>
                    </Link>
                    <Link href={`/dashboard/projects/${id}/time`} className="bg-card border p-4 rounded-lg text-center hover:border-primary transition-colors">
                        <span className="block font-semibold">Time Tracking</span>
                        <span className="text-xs text-muted-foreground">Log hours</span>
                    </Link>
                </div>

                <ProjectTasks projectId={id} />
                <ProjectMilestones projectId={id} />

                <div className="p-6 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-4">Project Info</h3>
                    <dl className="space-y-2 text-sm">
                         <div>
                            <dt className="text-muted-foreground">Type</dt>
                            <dd className="capitalize">{project.type}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Phase</dt>
                            <dd>{project.phase || 'Not set'}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Created</dt>
                            <dd>{new Date(project.createdAt).toLocaleDateString()}</dd>
                        </div>
                    </dl>
                </div>
                
                <div className="p-6 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-4">Client Info</h3>
                    <dl className="space-y-2 text-sm">
                         <div>
                            <dt className="text-muted-foreground">Email</dt>
                            <dd><a href={`mailto:${project.client.email}`} className="hover:underline">{project.client.email || '-'}</a></dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Phone</dt>
                            <dd>{project.client.phone || '-'}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    </div>
  )
}
