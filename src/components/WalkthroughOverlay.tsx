'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { FaTimes, FaArrowRight } from 'react-icons/fa'

export default function WalkthroughOverlay() {
  const pathname = usePathname()
  const [activeTour, setActiveTour] = useState<any>(null)
  const [stepIndex, setStepIndex] = useState(0)

  // Mock tours for now - in real app, fetch from /api/help/walkthroughs
  const tours = {
      '/dashboard': {
          title: 'Dashboard Overview',
          steps: [
              { target: 'h1', content: 'Welcome to your Dashboard! Here is your overview.' },
              { target: 'nav', content: 'Use the sidebar to navigate between Clients, Projects, and Inventory.' }
          ]
      },
      '/dashboard/projects': {
          title: 'Managing Projects',
          steps: [
              { target: 'button', content: 'Click here to create a new Project.' },
              { target: 'table', content: 'Your list of active and prospective projects will appear here.' }
          ]
      }
  }

  useEffect(() => {
      // Check if we should show a tour for this page
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tour = (tours as any)[pathname]
      if (tour && !localStorage.getItem(`tour_completed_${pathname}`)) {
          setActiveTour(tour)
          setStepIndex(0)
      } else {
          setActiveTour(null)
      }
  }, [pathname])

  if (!activeTour) return null

  const currentStep = activeTour.steps[stepIndex]

  const handleNext = () => {
      if (stepIndex < activeTour.steps.length - 1) {
          setStepIndex(stepIndex + 1)
      } else {
          handleClose()
      }
  }

  const handleClose = () => {
      localStorage.setItem(`tour_completed_${pathname}`, 'true')
      setActiveTour(null)
  }

  return (
    <div className="fixed bottom-8 right-8 w-80 bg-white border shadow-xl rounded-lg p-4 z-50 animate-in slide-in-from-bottom-10">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-sm text-primary">{activeTour.title}</h4>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground"><FaTimes size={12}/></button>
        </div>
        <p className="text-sm text-gray-600 mb-4">{currentStep.content}</p>
        <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Step {stepIndex + 1} of {activeTour.steps.length}</span>
            <button onClick={handleNext} className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded text-xs hover:bg-primary/90">
                {stepIndex === activeTour.steps.length - 1 ? 'Finish' : 'Next'} <FaArrowRight size={10} />
            </button>
        </div>
    </div>
  )
}
