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
    <div className="space-y-6 p-8 md:p-10">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Projects</h1>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
            >
                <FaPlus /> Add Project
            </button>
        </div>

         <div className="rounded-md border border-[#E8E8E8] bg-white overflow-hidden">
             <table className="w-full text-sm">
                <thead className="bg-[#FAFAFA] border-b border-[#E8E8E8]">
                    <tr>
                        <th className="p-4 font-semibold text-foreground text-left">Project Name</th>
                        <th className="p-4 font-semibold text-foreground text-left">Client</th>
                        <th className="p-4 font-semibold text-foreground text-left">Type</th>
                        <th className="p-4 font-semibold text-foreground text-left">Status</th>
                        <th className="p-4 font-semibold text-foreground text-left">Address</th>
                        <th className="p-4 font-semibold text-foreground text-right"></th>
                    </tr>
                </thead>
                 <tbody>
                    {projects?.map((project: { id: string; name: string; client?: { name: string }; type: string; status: string; projectAddress?: string }) => (
                         <tr key={project.id} className="border-b border-[#E8E8E8] last:border-b-0 hover:bg-[#FAFAFA] transition-colors">
                             <td className="p-4 font-medium text-foreground">{project.name}</td>
                             <td className="p-4 text-muted-foreground">{project.client?.name || '-'}</td>
                             <td className="p-4 text-muted-foreground capitalize">{project.type}</td>
                             <td className="p-4 text-muted-foreground capitalize">{project.status.replace('_', ' ')}</td>
                             <td className="p-4 text-muted-foreground truncate max-w-xs">{project.projectAddress || '-'}</td>
                             <td className="p-4 text-right">
                                <Link href={`/dashboard/projects/${project.id}`} className="text-primary hover:text-primary/80 font-medium transition-colors">
                                    Open
                                </Link>
                            </td>
                         </tr>
                    ))}
                    {projects?.length === 0 && (
                         <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No projects found.</td></tr>
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
        <div className="bg-white text-foreground p-6 rounded-md w-full max-w-md border border-[#E8E8E8] shadow-lg max-h-[90vh] overflow-auto">
            <h2 className="text-lg font-semibold mb-5 text-foreground">New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-1.5 text-foreground">
                        {meta.name.label}
                        <span className="text-xs text-muted-foreground block font-normal mt-0.5">{meta.name.description}</span>
                    </label>
                    <input name="name" placeholder={meta.name.placeholder} required className="w-full rounded-md border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                
                <div>
                    <label className="block text-sm font-semibold mb-1.5 text-foreground">Who is the client?</label>
                    <select name="clientId" required className="w-full rounded-md border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                        <option value="">Select Client</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1 text-foreground">
                            Type
                            <span className="text-muted-foreground" title={meta.type.description}><FaQuestionCircle size={10} /></span>
                        </label>
                        <select name="type" className="w-full rounded-md border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 text-foreground">Status</label>
                        <select name="status" className="w-full rounded-md border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                            <option value="prospect">Prospect</option>
                            <option value="active">Active</option>
                            <option value="on_hold">On Hold</option>
                            <option value="complete">Complete</option>
                        </select>
                    </div>
                </div>

                <div>
                     <label className="block text-sm font-semibold mb-1.5 text-foreground">
                        {meta.address.label}
                        <span className="text-xs text-muted-foreground block font-normal mt-0.5">{meta.address.description}</span>
                    </label>
                    <input name="projectAddress" placeholder="e.g. 123 Main St, New York, NY" className="w-full rounded-md border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1.5 text-foreground">
                        {meta.description.label}
                        <span className="text-xs text-muted-foreground block font-normal mt-0.5">{meta.description.description}</span>
                    </label>
                    <textarea name="description" placeholder={meta.description.placeholder} className="w-full rounded-md border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" rows={3} />
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#E8E8E8]">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[#F7F7F7] rounded-md transition-colors">Cancel</button>
                    <button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium transition-colors">{isLoading ? 'Creating...' : 'Create Project'}</button>
                </div>
            </form>
        </div>
    )
}
