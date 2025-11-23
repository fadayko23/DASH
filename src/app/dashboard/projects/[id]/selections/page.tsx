import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { FaArrowLeft, FaDownload, FaShareAlt, FaExternalLinkAlt } from "react-icons/fa"

export default async function ProjectSelectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return <div>Unauthorized</div>
  
  const { id } = await params
  const project = await prisma.project.findUnique({
      where: { id },
      include: {
          spaces: {
              include: {
                  products: {
                      include: {
                          product: {
                              include: { media: true, vendor: true }
                          },
                          variant: {
                                include: { media: true }
                          }
                      }
                  }
              }
          }
      }
  })

  if (!project) return <div>Project not found</div>

  return (
    <div className="flex flex-col h-full bg-muted/10">
        {/* Header */}
        <header className="bg-background border-b sticky top-0 z-10 px-8 py-4 flex justify-between items-center shadow-sm">
            <div>
                <Link href={`/dashboard/projects/${id}`} className="text-xs text-muted-foreground hover:underline mb-1 block">
                    &larr; Back to Project
                </Link>
                <h1 className="text-2xl font-bold text-foreground">Selection List</h1>
                <p className="text-sm text-muted-foreground">{project.name}</p>
            </div>
            <div className="flex gap-2">
                 <button className="flex items-center gap-2 border bg-background px-3 py-2 rounded-md text-sm hover:bg-accent">
                    <FaShareAlt /> Share
                 </button>
                 <button className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm hover:bg-primary/90">
                    <FaDownload /> Export PDF
                 </button>
            </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {project.spaces.map(space => (
                    <div key={space.id} className="space-y-4">
                        <div className="flex items-center gap-2">
                             <div className="h-px flex-1 bg-border"></div>
                             <h2 className="font-semibold text-lg whitespace-nowrap text-muted-foreground">{space.name}</h2>
                             <div className="h-px flex-1 bg-border"></div>
                        </div>

                        {space.products.length > 0 ? (
                            <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground border-b">
                                        <tr>
                                            <th className="p-4 w-24">Image</th>
                                            <th className="p-4">Product Name</th>
                                            <th className="p-4">Selection Name / Tag</th>
                                            <th className="p-4">Install Details</th>
                                            <th className="p-4 text-right">Link</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {space.products.map(pp => {
                                            const product = pp.product
                                            const media = pp.variant?.media[0] || product.media[0]
                                            return (
                                                <tr key={pp.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="p-4">
                                                        <div className="h-16 w-16 bg-muted rounded-md border overflow-hidden relative">
                                                            {media?.url ? (
                                                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${media.url})` }} />
                                                            ) : (
                                                                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium text-foreground">{product.name}</div>
                                                        <div className="text-xs text-muted-foreground">{pp.variant?.name || product.baseSku}</div>
                                                        <div className="text-xs text-muted-foreground">{product.vendor?.name}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium">{pp.elementLabel}</div>
                                                        {pp.projectTag && <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">{pp.projectTag}</span>}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-muted-foreground max-w-xs truncate">
                                                            <span className="font-semibold text-foreground">Install:</span> {pp.notes || 'Field verify with client.'}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {(product.urlSource || product.urlVendor) && (
                                                            <a href={product.urlSource || product.urlVendor || '#'} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                                                                View <FaExternalLinkAlt size={10} />
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground italic text-sm bg-muted/10 rounded-lg border border-dashed">
                                No items selected for {space.name} yet.
                            </div>
                        )}
                    </div>
                ))}

                {project.spaces.length === 0 && (
                    <div className="text-center py-20">
                        <h3 className="text-lg font-medium">No Spaces Defined</h3>
                        <p className="text-muted-foreground">Add spaces to this project to start making selections.</p>
                        <Link href={`/dashboard/projects/${id}/spaces`} className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md">
                            Manage Spaces
                        </Link>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

