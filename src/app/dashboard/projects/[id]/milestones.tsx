'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaPlus, FaFlag } from 'react-icons/fa'

export default function ProjectMilestones({ projectId }: { projectId: string }) {
  const [isAdding, setIsAdding] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ name: '', amount: '', date: '' })
  
  const { data: milestones, refetch } = useQuery({
      queryKey: ['milestones', projectId],
      queryFn: () => fetch(`/api/projects/${projectId}/milestones`).then(res => res.json())
  })

  const handleAdd = async (e: React.FormEvent) => {
      e.preventDefault()
      await fetch(`/api/projects/${projectId}/milestones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              name: newMilestone.name,
              amount: parseFloat(newMilestone.amount),
              targetDate: newMilestone.date
          })
      })
      setIsAdding(false)
      setNewMilestone({ name: '', amount: '', date: '' })
      refetch()
  }

  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Milestones</h3>
            <button onClick={() => setIsAdding(!isAdding)} className="text-sm text-primary hover:underline">
                {isAdding ? 'Cancel' : <span className="flex items-center gap-1"><FaPlus size={10}/> Add</span>}
            </button>
        </div>

        {isAdding && (
            <form onSubmit={handleAdd} className="space-y-2 bg-muted/30 p-3 rounded">
                <input 
                    className="w-full border rounded px-2 py-1 text-sm" 
                    placeholder="Milestone Name" 
                    value={newMilestone.name}
                    onChange={e => setNewMilestone({...newMilestone, name: e.target.value})}
                    required
                />
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        className="w-1/2 border rounded px-2 py-1 text-sm" 
                        placeholder="Amount ($)" 
                        value={newMilestone.amount}
                        onChange={e => setNewMilestone({...newMilestone, amount: e.target.value})}
                    />
                    <input 
                        type="date" 
                        className="w-1/2 border rounded px-2 py-1 text-sm" 
                        value={newMilestone.date}
                        onChange={e => setNewMilestone({...newMilestone, date: e.target.value})}
                    />
                </div>
                <button type="submit" className="w-full bg-primary text-primary-foreground px-2 py-1 rounded text-sm">Save</button>
            </form>
        )}

        <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {milestones?.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 border rounded bg-background">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                            <FaFlag size={12}/>
                        </div>
                        <div>
                            <div className="font-medium text-sm">{m.name}</div>
                            <div className="text-xs text-muted-foreground">
                                {m.targetDate ? new Date(m.targetDate).toLocaleDateString() : 'No date'}
                            </div>
                        </div>
                    </div>
                    <div className="font-semibold text-sm">
                        ${parseFloat(m.amount || '0').toLocaleString()}
                    </div>
                </div>
            ))}
            {milestones?.length === 0 && <div className="text-sm text-muted-foreground italic">No milestones set.</div>}
        </div>
    </div>
  )
}
