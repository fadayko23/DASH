'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaPlus, FaCheckCircle, FaRegCircle } from 'react-icons/fa'

export default function ProjectTasks({ projectId }: { projectId: string }) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const { data: tasks, refetch } = useQuery({
      queryKey: ['tasks', projectId],
      queryFn: () => fetch(`/api/projects/${projectId}/tasks`).then(res => res.json())
  })

  const handleAddTask = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newTaskTitle.trim()) return
      await fetch(`/api/projects/${projectId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTaskTitle })
      })
      setNewTaskTitle('')
      refetch()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleStatus = async (task: any) => {
      const newStatus = task.status === 'done' ? 'todo' : 'done'
      await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
      })
      refetch()
  }

  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
        <h3 className="font-semibold text-lg">Tasks</h3>
        
        <form onSubmit={handleAddTask} className="flex gap-2">
            <input 
                className="flex-1 border rounded px-3 py-2 text-sm bg-transparent"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <button type="submit" className="bg-primary text-primary-foreground px-3 py-2 rounded hover:bg-primary/90">
                <FaPlus />
            </button>
        </form>

        <div className="space-y-2">
            {tasks?.map((task: { id: string; title: string; status: string; dueDate?: string }) => (
                <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded group">
                    <button onClick={() => toggleStatus(task)} className="text-muted-foreground hover:text-primary">
                        {task.status === 'done' ? <FaCheckCircle className="text-green-500"/> : <FaRegCircle />}
                    </button>
                    <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                        {task.title}
                    </span>
                    {task.dueDate && (
                        <span className="text-xs text-muted-foreground ml-auto">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                    )}
                </div>
            ))}
            {tasks?.length === 0 && <div className="text-sm text-muted-foreground italic">No tasks yet.</div>}
        </div>
    </div>
  )
}
