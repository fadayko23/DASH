'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CatalogPicker({ onSelect }: { onSelect: (product: any, variant?: any) => void }) {
  const [search, setSearch] = useState('')
  const { data: products } = useQuery({
      queryKey: ['catalog', search],
      queryFn: () => fetch(`/api/catalog/products?search=${search}`).then(res => res.json())
  })

  return (
    <div className="space-y-4">
        <input 
            className="w-full border rounded px-3 py-2" 
            placeholder="Search catalog..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
        <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {products?.map((product: any) => (
                <div key={product.id} className="border p-3 rounded hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(product)}>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.vendor?.name}</div>
                </div>
            ))}
        </div>
    </div>
  )
}
