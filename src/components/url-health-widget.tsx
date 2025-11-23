'use client'

import { useState } from 'react'
import { FaCheckCircle, FaExclamationTriangle, FaSpinner, FaSync } from 'react-icons/fa'

export function UrlHealthWidget({ productId, initialHealth }: { productId: string, initialHealth?: { isBroken: boolean; status?: number } }) {
  const [health, setHealth] = useState(initialHealth)
  const [isLoading, setIsLoading] = useState(false)

  const checkUrl = async () => {
      setIsLoading(true)
      try {
          const res = await fetch(`/api/catalog/products/${productId}/check-url`, { method: 'POST' })
          const data = await res.json()
          setHealth(data)
      } catch (e) {
          console.error(e)
      } finally {
          setIsLoading(false)
      }
  }

  if (!health && !isLoading) {
      return (
          <button onClick={checkUrl} className="text-sm text-primary hover:underline flex items-center gap-1">
             <FaSync size={12} /> Check URL Health
          </button>
      )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isLoading ? (
          <span className="flex items-center gap-1 text-muted-foreground"><FaSpinner className="animate-spin"/> Checking...</span>
      ) : health?.isBroken ? (
          <span className="flex items-center gap-1 text-red-500 font-medium">
              <FaExclamationTriangle /> Broken Link ({health.status || 'Error'})
          </span>
      ) : (
          <span className="flex items-center gap-1 text-green-500 font-medium">
              <FaCheckCircle /> URL Active
          </span>
      )}
      {!isLoading && (
          <button onClick={checkUrl} title="Re-check" className="text-muted-foreground hover:text-foreground ml-2">
              <FaSync size={12} />
          </button>
      )}
    </div>
  )
}
