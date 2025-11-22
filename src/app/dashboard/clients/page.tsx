'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: clients, refetch } = useQuery({
      queryKey: ['clients'],
      queryFn: () => fetch('/api/clients').then(res => res.json())
  })

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
            >
                <FaPlus /> Add Client
            </button>
        </div>

        <div className="rounded-md border">
             <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium">Email</th>
                        <th className="p-4 font-medium">Phone</th>
                        <th className="p-4 font-medium">Address</th>
                    </tr>
                </thead>
                 <tbody>
                    {clients?.map((client: { id: string; name: string; email?: string; phone?: string; primaryAddress?: string }) => (
                         <tr key={client.id} className="border-t hover:bg-muted/50">
                             <td className="p-4 font-medium">{client.name}</td>
                             <td className="p-4">{client.email || '-'}</td>
                             <td className="p-4">{client.phone || '-'}</td>
                             <td className="p-4 truncate max-w-xs">{client.primaryAddress || '-'}</td>
                         </tr>
                    ))}
                    {clients?.length === 0 && (
                         <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No clients found.</td></tr>
                    )}
                 </tbody>
            </table>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <ClientForm onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); refetch(); }} />
            </div>
        )}
    </div>
  )
}

function ClientForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const form = e.target as HTMLFormElement
        const data = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            email: (form.elements.namedItem('email') as HTMLInputElement).value,
            phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
            primaryAddress: (form.elements.namedItem('primaryAddress') as HTMLInputElement).value,
        }
        
        await fetch('/api/clients', { method: 'POST', body: JSON.stringify(data) })
        setIsLoading(false)
        onSuccess()
    }

    return (
        <div className="bg-card text-card-foreground p-6 rounded-lg w-full max-w-md border shadow-lg">
            <h2 className="text-xl font-bold mb-4">New Client</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" placeholder="Name" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                <input name="email" type="email" placeholder="Email" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                <input name="phone" placeholder="Phone" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                <input name="primaryAddress" placeholder="Address" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm hover:bg-muted rounded-md">Cancel</button>
                    <button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">{isLoading ? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </div>
    )
}
