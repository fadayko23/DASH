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
    <div className={`group relative flex flex-col justify-between space-y-3 rounded-md border border-[#E8E8E8] bg-white p-5 transition-all duration-150 hover:border-[#D0D0D0] hover:shadow-sm ${className}`}>
      <div className="flex flex-row items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
          {subtext && <p className="text-xs text-muted-foreground leading-relaxed">{subtext}</p>}
        </div>
        {icon && (
          <div className="ml-3 text-muted-foreground group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
      </div>
      {value && (
        <div className="pt-2">
          <div className="text-2xl font-semibold text-foreground">{value}</div>
        </div>
      )}
      {href && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <FaArrowRight className="text-primary h-3.5 w-3.5" />
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

