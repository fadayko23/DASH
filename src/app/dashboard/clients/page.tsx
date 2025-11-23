'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaPlus, FaSearch, FaUser } from 'react-icons/fa'
import Link from 'next/link'

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  
  const { data: clients, refetch } = useQuery({
      queryKey: ['clients'],
      queryFn: () => fetch('/api/clients').then(res => res.json())
  })

  const filteredClients = clients?.filter((c: any) => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">All Clients</h1>
                <p className="text-muted-foreground mt-1">Manage your client relationships.</p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
            >
                <FaPlus /> Add Client
            </button>
        </div>

        <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
                type="text" 
                placeholder="Search clients..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients?.map((client: { id: string; name: string; email?: string; phone?: string; primaryAddress?: string }) => (
                 <Link href={`/dashboard/clients/${client.id}`} key={client.id} className="group bg-card p-6 rounded-xl border shadow-sm hover:border-primary/50 transition-all">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            <FaUser size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{client.name}</h3>
                            <div className="text-sm text-muted-foreground">{client.email || 'No email'}</div>
                        </div>
                     </div>
                     <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Phone</span>
                            <span className="font-medium text-foreground">{client.phone || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Location</span>
                            <span className="font-medium text-foreground truncate max-w-[150px]">{client.primaryAddress || '-'}</span>
                        </div>
                     </div>
                 </Link>
            ))}
            {filteredClients?.length === 0 && (
                 <div className="col-span-full text-center py-12 text-muted-foreground">
                    No clients found matching your search.
                 </div>
            )}
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
                <div className="space-y-1">
                    <label className="text-sm font-medium">Name</label>
                    <input name="name" placeholder="Client Name" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Email</label>
                    <input name="email" type="email" placeholder="email@example.com" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Phone</label>
                    <input name="phone" placeholder="(555) 555-5555" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Address</label>
                    <input name="primaryAddress" placeholder="123 Main St, City, State Zip" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm hover:bg-muted rounded-md">Cancel</button>
                    <button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">{isLoading ? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </div>
    )
}
