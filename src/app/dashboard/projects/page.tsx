'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Link from 'next/link'
import { FaPlus, FaQuestionCircle } from 'react-icons/fa'
import { fieldConfigs } from '@/config/fieldMetadata'

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: projects, refetch } = useQuery({
      queryKey: ['projects'],
      queryFn: () => fetch('/api/projects').then(res => res.json())
  })
  const { data: clients } = useQuery({
      queryKey: ['clients'],
      queryFn: () => fetch('/api/clients').then(res => res.json())
  })

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
            >
                <FaPlus /> Add Project
            </button>
        </div>

         <div className="rounded-md border">
             <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="p-4 font-medium">Project Name</th>
                        <th className="p-4 font-medium">Client</th>
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Address</th>
                        <th className="p-4 font-medium"></th>
                    </tr>
                </thead>
                 <tbody>
                    {projects?.map((project: { id: string; name: string; client?: { name: string }; type: string; status: string; projectAddress?: string }) => (
                         <tr key={project.id} className="border-t hover:bg-muted/50">
                             <td className="p-4 font-medium">{project.name}</td>
                             <td className="p-4">{project.client?.name || '-'}</td>
                             <td className="p-4 capitalize">{project.type}</td>
                             <td className="p-4 capitalize">{project.status.replace('_', ' ')}</td>
                             <td className="p-4 truncate max-w-xs">{project.projectAddress || '-'}</td>
                             <td className="p-4 text-right">
                                <Link href={`/dashboard/projects/${project.id}`} className="text-primary hover:underline">
                                    Open
                                </Link>
                            </td>
                         </tr>
                    ))}
                    {projects?.length === 0 && (
                         <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No projects found.</td></tr>
                    )}
                 </tbody>
            </table>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <ProjectForm clients={clients || []} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); refetch(); }} />
            </div>
        )}
    </div>
  )
}

function ProjectForm({ clients, onClose, onSuccess }: { clients: { id: string; name: string }[], onClose: () => void, onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const meta = fieldConfigs.project
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const form = e.target as HTMLFormElement
        const data = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            clientId: (form.elements.namedItem('clientId') as HTMLSelectElement).value,
            type: (form.elements.namedItem('type') as HTMLSelectElement).value,
            status: (form.elements.namedItem('status') as HTMLSelectElement).value,
            projectAddress: (form.elements.namedItem('projectAddress') as HTMLInputElement).value,
            description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
        }
        
        await fetch('/api/projects', { method: 'POST', body: JSON.stringify(data) })
        setIsLoading(false)
        onSuccess()
    }

    return (
        <div className="bg-card text-card-foreground p-6 rounded-lg w-full max-w-md border shadow-lg max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {meta.name.label}
                        <span className="text-xs text-muted-foreground block font-normal">{meta.name.description}</span>
                    </label>
                    <input name="name" placeholder={meta.name.placeholder} required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Who is the client?</label>
                    <select name="clientId" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                        <option value="">Select Client</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                            Type
                            <span className="text-muted-foreground" title={meta.type.description}><FaQuestionCircle size={10} /></span>
                        </label>
                        <select name="type" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select name="status" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                            <option value="prospect">Prospect</option>
                            <option value="active">Active</option>
                            <option value="on_hold">On Hold</option>
                            <option value="complete">Complete</option>
                        </select>
                    </div>
                </div>

                <div>
                     <label className="block text-sm font-medium mb-1">
                        {meta.address.label}
                        <span className="text-xs text-muted-foreground block font-normal">{meta.address.description}</span>
                    </label>
                    <input name="projectAddress" placeholder="e.g. 123 Main St, New York, NY" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        {meta.description.label}
                        <span className="text-xs text-muted-foreground block font-normal">{meta.description.description}</span>
                    </label>
                    <textarea name="description" placeholder={meta.description.placeholder} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" rows={3} />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm hover:bg-muted rounded-md">Cancel</button>
                    <button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">{isLoading ? 'Creating...' : 'Create Project'}</button>
                </div>
            </form>
        </div>
    )
}
