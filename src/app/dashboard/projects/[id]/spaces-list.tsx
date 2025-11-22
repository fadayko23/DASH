'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaPlus, FaDoorOpen } from 'react-icons/fa'

import Link from 'next/link'

export default function SpacesList({ projectId }: { projectId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: spaces, refetch } = useQuery({
      queryKey: ['spaces', projectId],
      queryFn: () => fetch(`/api/projects/${projectId}/spaces`).then(res => res.json())
  })

  return (
    <div className="rounded-lg border bg-card p-6">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaDoorOpen className="text-primary"/> Spaces
            </h3>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/80 flex items-center gap-1"
            >
                <FaPlus size={12}/> Add Space
            </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces?.map((space: { id: string; name: string; floor?: string; roomType?: { name: string } }) => (
                <Link href={`/dashboard/projects/${projectId}/spaces/${space.id}`} key={space.id} className="p-4 border rounded-md hover:bg-muted/20 transition-colors cursor-pointer block">
                    <div className="font-medium">{space.name}</div>
                    <div className="text-xs text-muted-foreground">
                        {space.floor ? `Floor ${space.floor}` : 'No floor set'} • {space.roomType?.name || 'General'}
                    </div>
                </Link>
            ))}
             {spaces?.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-4 text-sm">
                    No spaces defined yet. Add rooms to start designing.
                </div>
            )}
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <SpaceForm projectId={projectId} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); refetch(); }} />
            </div>
        )}
    </div>
  )
}

function SpaceForm({ projectId, onClose, onSuccess }: { projectId: string, onClose: () => void, onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const form = e.target as HTMLFormElement
        const data = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            floor: (form.elements.namedItem('floor') as HTMLInputElement).value,
            notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value,
        }
        
        await fetch(`/api/projects/${projectId}/spaces`, { method: 'POST', body: JSON.stringify(data) })
        setIsLoading(false)
        onSuccess()
    }

    return (
        <div className="bg-card text-card-foreground p-6 rounded-lg w-full max-w-md border shadow-lg">
            <h2 className="text-xl font-bold mb-4">New Space</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" placeholder="Space Name (e.g. Master Bedroom)" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                <input name="floor" placeholder="Floor / Level" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                <textarea name="notes" placeholder="Notes" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" rows={2} />
                
                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm hover:bg-muted rounded-md">Cancel</button>
                    <button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">{isLoading ? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </div>
    )
}
