'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Link from 'next/link'
import { AddProductButton } from '@/components/add-product-button'

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      const res = await fetch(`/api/catalog/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

  if (isLoading) return <div>Loading inventory...</div>

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <div className="flex gap-4 items-center">
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring w-64"
                />
                <AddProductButton />
            </div>
        </div>

        <div className="rounded-md border">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="p-4 font-medium">Product</th>
                        <th className="p-4 font-medium">Vendor</th>
                        <th className="p-4 font-medium">Category</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Your Price</th>
                        <th className="p-4 font-medium"></th>
                    </tr>
                </thead>
                <tbody>
                    {products?.map((product: { id: string; name: string; baseSku?: string; vendor?: { name: string }; productType?: { name: string; category?: { name: string } }; status: string; userPrice?: string }) => (
                        <tr key={product.id} className="border-t hover:bg-muted/50">
                            <td className="p-4">
                                <div className="font-medium">{product.name}</div>
                                <div className="text-xs text-muted-foreground">{product.baseSku}</div>
                            </td>
                            <td className="p-4">{product.vendor?.name || '-'}</td>
                            <td className="p-4">{product.productType?.category?.name} / {product.productType?.name}</td>
                            <td className="p-4 capitalize">{product.status}</td>
                            <td className="p-4">
                                {product.userPrice ? `$${product.userPrice}` : <span className="text-muted-foreground italic">Not Set</span>}
                            </td>
                             <td className="p-4 text-right">
                                <Link href={`/dashboard/inventory/${product.id}`} className="text-primary hover:underline">
                                    Manage
                                </Link>
                            </td>
                        </tr>
                    ))}
                    {products?.length === 0 && (
                         <tr>
                            <td colSpan={6} className="p-4 text-center text-muted-foreground">No products found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  )
}
