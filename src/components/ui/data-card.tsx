import React from 'react'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'

interface DataCardProps {
  title: string
  value?: string | number
  subtext?: string
  href?: string
  icon?: React.ReactNode
  className?: string
}

export function DataCard({ title, value, subtext, href, icon, className = '' }: DataCardProps) {
  const Content = () => (
    <div className={`group relative flex flex-col justify-between space-y-2 rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 ${className}`}>
      <div className="flex flex-row items-center justify-between space-y-0">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{title}</h3>
        {icon && <div className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</div>}
      </div>
      {(value || subtext) && (
        <div>
            {value && <div className="text-2xl font-bold">{value}</div>}
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
      )}
      {href && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <FaArrowRight className="text-primary h-4 w-4" />
          </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full">
        <Content />
      </Link>
    )
  }

  return <Content />
}

