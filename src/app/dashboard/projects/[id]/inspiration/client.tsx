'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaPlus, FaEye, FaEyeSlash } from 'react-icons/fa'

export default function ProjectInspirationClient({ projectId }: { projectId: string }) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  
  const { data: projectImages, refetch: refetchProject } = useQuery({
      queryKey: ['project-inspiration', projectId],
      queryFn: () => fetch(`/api/projects/${projectId}/inspiration`).then(res => res.json())
  })

  const { data: libraryImages } = useQuery({
      queryKey: ['inspiration-library'],
      queryFn: () => fetch('/api/inspiration').then(res => res.json()),
      enabled: isLibraryOpen
  })

  const handleAttach = async (imageId: string) => {
      await fetch(`/api/projects/${projectId}/inspiration`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              inspirationImageId: imageId,
              clientVisible: true,
              notes: ''
          })
      })
      setIsLibraryOpen(false)
      refetchProject()
  }

  return (
    <div className="space-y-8">
        {/* Attached Images */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Project Inspiration</h3>
                <button 
                    onClick={() => setIsLibraryOpen(true)}
                    className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/80 flex items-center gap-1"
                >
                    <FaPlus size={12}/> Add from Library
                </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {projectImages?.map((item: any) => (
                    <div key={item.id} className="group relative bg-gray-100 rounded-md overflow-hidden aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.inspirationImage.url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                            {item.clientVisible ? <FaEye title="Visible to Client" /> : <FaEyeSlash title="Hidden from Client" />}
                        </div>
                    </div>
                ))}
                {projectImages?.length === 0 && <div className="col-span-full text-sm text-muted-foreground italic">No images attached.</div>}
            </div>
        </div>

        {/* Mood Boards (Placeholder for MVP - fully implemented API, UI logic similar to above) */}
        <div className="space-y-4 border-t pt-8">
             <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Mood Boards</h3>
                <button className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/80 flex items-center gap-1" disabled title="Coming in Phase 9.x">
                    <FaPlus size={12}/> Create Board
                </button>
            </div>
            <div className="text-sm text-muted-foreground">Mood board creation canvas coming soon.</div>
        </div>

        {/* Library Modal */}
        {isLibraryOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white w-full max-w-3xl h-[80vh] rounded-lg shadow-xl flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-bold">Select from Library</h3>
                        <button onClick={() => setIsLibraryOpen(false)}>&times;</button>
                    </div>
                    <div className="flex-1 overflow-auto p-4 grid grid-cols-3 gap-4">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {libraryImages?.map((img: any) => (
                            <button key={img.id} onClick={() => handleAttach(img.id)} className="aspect-square bg-gray-50 hover:ring-2 ring-primary rounded overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}
