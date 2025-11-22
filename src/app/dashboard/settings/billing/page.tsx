'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'

export default function RoleRatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: rates, refetch } = useQuery({
      queryKey: ['role-rates'],
      queryFn: () => fetch('/api/settings/role-rates').then(res => res.json())
  })

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Role Rates</h1>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
            >
                <FaPlus /> Add Role Rate
            </button>
        </div>

        <div className="rounded-md border bg-card">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="p-4 font-medium">Role Name</th>
                        <th className="p-4 font-medium">Hourly Rate ($)</th>
                    </tr>
                </thead>
                <tbody>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {rates?.map((r: any) => (
                        <tr key={r.id} className="border-t hover:bg-muted/50">
                            <td className="p-4 font-medium">{r.roleName}</td>
                            <td className="p-4 font-mono">${r.hourlyRate}</td>
                        </tr>
                    ))}
                    {rates?.length === 0 && (
                        <tr><td colSpan={2} className="p-4 text-center text-muted-foreground">No rates defined.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {isModalOpen && <RateForm onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); refetch(); }} />}
    </div>
  )
}

function RateForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const form = e.target as HTMLFormElement
        const data = {
            roleName: (form.elements.namedItem('roleName') as HTMLInputElement).value,
            hourlyRate: parseFloat((form.elements.namedItem('hourlyRate') as HTMLInputElement).value),
        }
        
        await fetch('/api/settings/role-rates', { method: 'POST', body: JSON.stringify(data) })
        setIsLoading(false)
        onSuccess()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground p-6 rounded-lg w-full max-w-md border shadow-lg">
                <h2 className="text-xl font-bold mb-4">New Role Rate</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Role Name</label>
                        <input name="roleName" placeholder="e.g. Senior Designer" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Hourly Rate</label>
                        <input name="hourlyRate" type="number" step="0.01" placeholder="150.00" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
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
