'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaPlus, FaUpload } from 'react-icons/fa'

export default function InspirationGallery() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: images, refetch } = useQuery({
      queryKey: ['inspiration'],
      queryFn: () => fetch('/api/inspiration').then(res => res.json())
  })

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Inspiration Library</h1>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
            >
                <FaUpload /> Upload Image
            </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {images?.map((img: any) => (
                <div key={img.id} className="aspect-square bg-gray-100 rounded-md overflow-hidden relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
            ))}
            {images?.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-12">No inspiration images uploaded yet.</div>
            )}
        </div>

        {isModalOpen && <UploadModal onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); refetch(); }} />}
    </div>
  )
}

function UploadModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [url, setUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        await fetch('/api/inspiration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        })
        setIsLoading(false)
        onSuccess()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground p-6 rounded-lg w-full max-w-md border shadow-lg">
                <h2 className="text-xl font-bold mb-4">Add Inspiration</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Image URL</label>
                        <input 
                            type="url" 
                            placeholder="https://..." 
                            value={url} 
                            onChange={e => setUrl(e.target.value)}
                            required 
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">For MVP, paste a public image URL (e.g. Unsplash).</p>
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
