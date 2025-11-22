'use client'

import { useState } from 'react'
import { updateStepStatus } from './tracker-actions'
import clsx from 'clsx'
import { FaCheck, FaSpinner } from 'react-icons/fa'

type Step = {
    key: string
    displayName: string
    status: 'not_started' | 'in_progress' | 'complete'
}

export default function ProjectTracker({ projectId, steps }: { projectId: string, steps: Step[] }) {
  const [loadingStep, setLoadingStep] = useState<string | null>(null)

  const handleStatusClick = async (step: Step) => {
      // Toggle logic: not_started -> in_progress -> complete -> not_started
      const nextStatusMap: Record<string, 'not_started' | 'in_progress' | 'complete'> = {
          'not_started': 'in_progress',
          'in_progress': 'complete',
          'complete': 'not_started'
      }
      const nextStatus = nextStatusMap[step.status]
      
      setLoadingStep(step.key)
      try {
          await updateStepStatus(projectId, step.key, nextStatus)
      } catch (e) {
          console.error(e)
      } finally {
          setLoadingStep(null)
      }
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
        <div className="flex items-center gap-2 min-w-max">
            {steps.map((step, idx) => (
                <div key={step.key} className="flex items-center">
                    {/* Step Circle */}
                    <button 
                        onClick={() => handleStatusClick(step)}
                        disabled={!!loadingStep}
                        className={clsx(
                            "flex flex-col items-center gap-2 group focus:outline-none",
                            loadingStep === step.key && "opacity-70 cursor-wait"
                        )}
                    >
                        <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                            step.status === 'complete' ? "bg-green-500 border-green-500 text-white" :
                            step.status === 'in_progress' ? "bg-blue-100 border-blue-500 text-blue-600" :
                            "bg-gray-50 border-gray-300 text-gray-400"
                        )}>
                            {loadingStep === step.key ? <FaSpinner className="animate-spin" /> : 
                             step.status === 'complete' ? <FaCheck size={12} /> : 
                             <span className="text-xs font-medium">{idx + 1}</span>}
                        </div>
                        <span className={clsx(
                            "text-xs font-medium whitespace-nowrap",
                            step.status === 'complete' ? "text-green-600" :
                            step.status === 'in_progress' ? "text-blue-600" :
                            "text-gray-500"
                        )}>
                            {step.displayName}
                        </span>
                    </button>

                    {/* Connector Line */}
                    {idx < steps.length - 1 && (
                        <div className={clsx(
                            "h-0.5 w-12 mx-2",
                            step.status === 'complete' ? "bg-green-500" : "bg-gray-200"
                        )} />
                    )}
                </div>
            ))}
        </div>
    </div>
  )
}
