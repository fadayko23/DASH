'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'

export default function TimeTrackingClient({ projectId }: { projectId: string }) {
  const [isLogging, setIsLogging] = useState(false)
  const { data: entries, refetch } = useQuery({
      queryKey: ['time-entries', projectId],
      queryFn: () => fetch(`/api/projects/${projectId}/time-entries`).then(res => res.json())
  })

  const handleLogTime = async (e: React.FormEvent) => {
      e.preventDefault()
      const form = e.target as HTMLFormElement
      const data = {
          date: (form.elements.namedItem('date') as HTMLInputElement).value,
          hours: parseFloat((form.elements.namedItem('hours') as HTMLInputElement).value),
          roleName: (form.elements.namedItem('roleName') as HTMLInputElement).value, // In real app, dropdown from RoleRate
          description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      }

      await fetch(`/api/projects/${projectId}/time-entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      })
      setIsLogging(false)
      refetch()
  }

  return (
    <div className="space-y-8">
        <button 
            onClick={() => setIsLogging(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
        >
            <FaPlus /> Log Time
        </button>

        {isLogging && (
            <div className="bg-card border rounded-lg p-6 shadow-sm max-w-xl">
                <h3 className="font-semibold mb-4">Log Time</h3>
                <form onSubmit={handleLogTime} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input name="date" type="date" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Hours</label>
                            <input name="hours" type="number" step="0.25" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <input name="roleName" placeholder="e.g. Designer" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea name="description" rows={2} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setIsLogging(false)} className="px-4 py-2 text-sm hover:bg-muted rounded-md">Cancel</button>
                        <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">Save</button>
                    </div>
                </form>
            </div>
        )}

        <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">User</th>
                        <th className="p-4 font-medium">Role</th>
                        <th className="p-4 font-medium">Description</th>
                        <th className="p-4 font-medium text-right">Hours</th>
                    </tr>
                </thead>
                <tbody>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {entries?.map((entry: any) => (
                        <tr key={entry.id} className="border-t hover:bg-muted/50">
                            <td className="p-4">{new Date(entry.date).toLocaleDateString()}</td>
                            <td className="p-4">{entry.user?.name}</td>
                            <td className="p-4">{entry.roleName}</td>
                            <td className="p-4 truncate max-w-xs">{entry.description}</td>
                            <td className="p-4 text-right font-mono font-medium">{entry.hours}</td>
                        </tr>
                    ))}
                    {entries?.length === 0 && (
                        <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No time logged yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  )
}
