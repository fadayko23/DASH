import React from 'react'

interface StatusBadgeProps {
  status: string
  children?: React.ReactNode
  className?: string
}

export function StatusBadge({ status, children, className = '' }: StatusBadgeProps) {
  // Map statuses to colors
  const getColor = (s: string) => {
    const lower = s.toLowerCase().replace('_', ' ')
    switch (lower) {
      case 'active':
      case 'completed':
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      case 'pending':
      case 'prospect':
      case 'draft':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      case 'on hold':
      case 'cancelled':
      case 'archived':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
      case 'design oversight':
      case 'design':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800'
      case 'documentation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-secondary text-secondary-foreground border-border'
    }
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getColor(status)} ${className}`}>
      {children || status.replace(/_/g, ' ')}
    </span>
  )
}

