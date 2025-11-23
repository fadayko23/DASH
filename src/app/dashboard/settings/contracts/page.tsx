'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'

export default function ContractTemplatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: templates, refetch } = useQuery({
      queryKey: ['contract-templates'],
      queryFn: () => fetch('/api/contracts/templates').then(res => res.json())
  })

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Contract Templates</h1>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
            >
                <FaPlus /> New Template
            </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {templates?.map((t: any) => (
                <div key={t.id} className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="font-semibold text-lg">{t.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{t.type} Contract</p>
                    <p className="text-xs text-muted-foreground mt-4 truncate">{t.body}</p>
                </div>
            ))}
            {templates?.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-12">No templates created yet.</div>
            )}
        </div>

        {isModalOpen && <TemplateForm onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); refetch(); }} />}
    </div>
  )
}

function TemplateForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const form = e.target as HTMLFormElement
        const data = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            type: (form.elements.namedItem('type') as HTMLSelectElement).value,
            body: (form.elements.namedItem('body') as HTMLTextAreaElement).value,
        }
        
        await fetch('/api/contracts/templates', { method: 'POST', body: JSON.stringify(data) })
        setIsLoading(false)
        onSuccess()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground p-6 rounded-lg w-full max-w-2xl border shadow-lg">
                <h2 className="text-xl font-bold mb-4">New Contract Template</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Template Name</label>
                        <input name="name" placeholder="e.g. Standard Design Agreement" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select name="type" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                            <option value="client">Client</option>
                            <option value="builder">Builder</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Contract Body</label>
                        <textarea name="body" rows={10} placeholder="Enter contract terms..." required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono" />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm hover:bg-muted rounded-md">Cancel</button>
                        <button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">{isLoading ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
