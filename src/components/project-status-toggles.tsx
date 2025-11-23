'use client'

import { useState } from 'react'
import { FaCheck, FaTimes, FaMinus } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

interface StepStatus {
  key: string
  displayName: string
  status: string
}

export function ProjectStatusToggles({ projectId, steps }: { projectId: string, steps: StepStatus[] }) {
  const router = useRouter()
  // Optimistic UI state
  const [localSteps, setLocalSteps] = useState(steps)

  // In a real app, this would call an API to update the status
  // For now, we'll just toggle locally and maybe show a toast
  const handleToggle = async (key: string, currentStatus: string) => {
      const newStatus = currentStatus === 'complete' ? 'not_started' : 'complete'
      
      setLocalSteps(prev => prev.map(s => s.key === key ? { ...s, status: newStatus } : s))

      // Call API
      try {
        await fetch(`/api/projects/${projectId}/tracker`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stepKey: key, status: newStatus })
        })
        router.refresh()
      } catch (e) {
        console.error("Failed to update status", e)
        // Revert on error
        setLocalSteps(steps)
      }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
         <h3 className="font-semibold">Status Tracking</h3>
         <button className="text-xs text-muted-foreground hover:underline">Show timestamps</button>
      </div>
      
      <div className="space-y-3">
        {localSteps.map((step) => (
            <div key={step.key} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                <span className="text-sm font-medium">{step.displayName}</span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleToggle(step.key, step.status)}
                        className={`
                            h-8 px-3 rounded-md text-xs font-medium border flex items-center gap-1 transition-colors
                            ${step.status === 'complete' 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                                : 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80'
                            }
                        `}
                    >
                        {step.status === 'complete' ? 'Yes' : 'No'}
                        <FaChevronDown className="opacity-50 ml-1" size={10} />
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}

function FaChevronDown({ className, size }: { className?: string, size?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 14} height={size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m6 9 6 6 6-6"/>
        </svg>
    )
}

