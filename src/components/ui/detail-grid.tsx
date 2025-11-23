import React from 'react'

interface DetailItemProps {
  label: string
  value?: React.ReactNode
  className?: string
}

export function DetailGrid({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 ${className}`}>
      {children}
    </div>
  )
}

export function DetailItem({ label, value, className = '' }: DetailItemProps) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="mt-1 text-sm font-medium text-foreground">
        {value || '—'}
      </div>
    </div>
  )
}

