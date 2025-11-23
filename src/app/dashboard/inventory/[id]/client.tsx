'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product, ProductVariant, Vendor, ProductType, ProductCategory, TenantProductOverride } from '@prisma/client'

type ProductDetail = Product & {
    vendor: Vendor | null;
    productType: (ProductType & { category: ProductCategory }) | null;
    variants: ProductVariant[];
    overrides?: TenantProductOverride[] | undefined; // Make optional or allow undefined
    userCost?: string;
    userPrice?: string;
    userMarkup?: string;
    userNotes?: string;
    userAvailability?: string;
    urlSource?: string | null;
    description?: string | null;
}

import { UrlHealthWidget } from '@/components/url-health-widget'

export default function ProductDetailClient({ product }: { product: ProductDetail }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    
    const [formData, setFormData] = useState({
        costPrice: product.userCost,
        sellPrice: product.userPrice,
        markupPercent: product.userMarkup,
        internalNotes: product.userNotes,
        availability: product.userAvailability
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/catalog/products/${product.id}/override`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (!res.ok) throw new Error('Failed to save')
            router.refresh()
            alert('Saved successfully!')
        } catch (err) {
            console.error(err)
            alert('Error saving override')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl space-y-8">
            <div className="flex items-center justify-between">
                 <div>
                    <Link href="/dashboard/inventory" className="text-sm text-muted-foreground hover:text-foreground mb-2 block">&larr; Back to Inventory</Link>
                    <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                    <p className="text-muted-foreground">{product.vendor?.name} | {product.productType?.category?.name} &gt; {product.productType?.name}</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="p-6 border rounded-lg bg-card">
                        <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-muted-foreground">Base SKU</dt>
                                <dd>{product.baseSku || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Source URL</dt>
                                <dd className="truncate flex items-center gap-2">
                                    <a href={product.urlSource || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {product.urlSource || '-'}
                                    </a>
                                    {product.urlSource && <UrlHealthWidget productId={product.id} />}
                                </dd>
                            </div>
                             <div>
                                <dt className="text-muted-foreground">Description</dt>
                                <dd className="col-span-2">{product.description || 'No description available.'}</dd>
                            </div>
                        </dl>
                    </div>

                     <div className="p-6 border rounded-lg bg-card">
                        <h3 className="text-lg font-semibold mb-4">Variants</h3>
                        <ul className="space-y-2">
                            {product.variants?.map((v) => (
                                <li key={v.id} className="p-2 border rounded bg-muted/20 flex justify-between text-sm">
                                    <span>{v.name}</span>
                                    <span className="text-muted-foreground">{v.variantSku}</span>
                                </li>
                            ))}
                            {product.variants?.length === 0 && <li className="text-muted-foreground italic">No variants listed.</li>}
                        </ul>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 border rounded-lg bg-card">
                        <h3 className="text-lg font-semibold mb-4">Your Pricing & Override</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Cost Price ($)</label>
                                <input 
                                    type="number" 
                                    name="costPrice"
                                    value={formData.costPrice} 
                                    onChange={handleChange}
                                    step="0.01"
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Markup (%)</label>
                                <input 
                                    type="number" 
                                    name="markupPercent"
                                    value={formData.markupPercent} 
                                    onChange={handleChange}
                                    step="1"
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Sell Price ($)</label>
                                <input 
                                    type="number" 
                                    name="sellPrice"
                                    value={formData.sellPrice} 
                                    onChange={handleChange}
                                    step="0.01"
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                />
                            </div>
                            
                             <div className="pt-4 border-t">
                                <label className="block text-sm font-medium mb-1">Availability</label>
                                <select 
                                    name="availability" 
                                    value={formData.availability} 
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                >
                                    <option value="default">Default</option>
                                    <option value="preferred">Preferred</option>
                                    <option value="hidden">Hidden</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Internal Notes</label>
                                <textarea 
                                    name="internalNotes"
                                    value={formData.internalNotes} 
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
