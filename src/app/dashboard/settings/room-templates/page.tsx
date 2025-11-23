'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'

export default function RoomTemplatesPage() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: templates, refetch } = useQuery({
      queryKey: ['room-templates'],
      queryFn: () => fetch('/api/settings/room-templates').then(res => res.json())
  })

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Room Templates</h1>
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
            >
                <FaPlus /> Add Template Element
            </button>
        </div>

        <div className="rounded-md border bg-card">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="p-4 font-medium">Room Type</th>
                        <th className="p-4 font-medium">Element Label</th>
                        <th className="p-4 font-medium">Key</th>
                    </tr>
                </thead>
                <tbody>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {templates?.map((t: any) => (
                        <tr key={t.id} className="border-t hover:bg-muted/50">
                            <td className="p-4">{t.roomType?.name || 'All Rooms'}</td>
                            <td className="p-4 font-medium">{t.label}</td>
                            <td className="p-4 font-mono text-xs text-muted-foreground">{t.key}</td>
                        </tr>
                    ))}
                    {templates?.length === 0 && (
                        <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No templates defined.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {isOpen && <TemplateForm onClose={() => setIsOpen(false)} onSuccess={() => { setIsOpen(false); refetch(); }} />}
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
            roomTypeId: (form.elements.namedItem('roomTypeId') as HTMLSelectElement).value || null, // Handle empty string as null
            label: (form.elements.namedItem('label') as HTMLInputElement).value,
            key: (form.elements.namedItem('key') as HTMLInputElement).value,
        }
        
        await fetch('/api/settings/room-templates', { method: 'POST', body: JSON.stringify(data) })
        setIsLoading(false)
        onSuccess()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground p-6 rounded-lg w-full max-w-md border shadow-lg">
                <h2 className="text-xl font-bold mb-4">New Element Template</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Label</label>
                        <input name="label" placeholder="e.g. Floor Tile" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Key</label>
                        <input name="key" placeholder="e.g. floor_tile" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Room Type (Optional)</label>
                        <select name="roomTypeId" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                            <option value="">All Rooms</option>
                            {/* Need to fetch room types here really, skipping for brevity in MVP */}
                        </select>
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
