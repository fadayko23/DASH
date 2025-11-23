/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { FaPlus, FaExclamationTriangle, FaTag } from 'react-icons/fa'
import CatalogPicker from './catalog-picker'
import { ProjectProduct, Product, Vendor, ProductVariant, ProductMedia } from '@prisma/client'

type SpecWithDetails = ProjectProduct & {
    product: Product & { vendor: Vendor | null; media: ProductMedia[] };
    variant: ProductVariant | null;
    tagConflict?: boolean; // Ensure this is recognized if not in ProjectProduct (it is)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SpaceSpecsClient({ projectId, spaceId, templates, initialSpecs }: { projectId: string, spaceId: string, templates: any[], initialSpecs: SpecWithDetails[] }) {
  const [specs, setSpecs] = useState(initialSpecs)
  const [activeElementKey, setActiveElementKey] = useState<string | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  // Group specs by elementKey
  const specsByElement = specs.reduce((acc: Record<string, SpecWithDetails[]>, spec) => {
      if (!acc[spec.elementKey]) acc[spec.elementKey] = []
      acc[spec.elementKey].push(spec)
      return acc
  }, {})

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddSpec = (product: any, variant?: any) => {
      if (!activeElementKey) return
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const template = templates.find((t: any) => t.key === activeElementKey)
      
      fetch(`/api/projects/${projectId}/specs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              spaceId,
              projectId,
              productId: product.id,
              variantId: variant?.id,
              elementKey: activeElementKey,
              elementLabel: template?.label || activeElementKey,
              projectTag: null // Initially null
          })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).then(res => res.json()).then((newSpec: any) => {
          setSpecs([...specs, newSpec])
          setIsPickerOpen(false)
      })
  }

  const handleUpdateTag = (specId: string, tag: string) => {
      fetch(`/api/projects/${projectId}/specs/${specId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectTag: tag })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).then(res => res.json()).then((updatedSpec: any) => {
          setSpecs(specs.map(s => s.id === specId ? updatedSpec : s))
      })
  }

  const handleDelete = (specId: string) => {
      if (!confirm('Delete selection?')) return
      fetch(`/api/projects/${projectId}/specs/${specId}`, {
          method: 'DELETE'
      }).then(() => {
          setSpecs(specs.filter(s => s.id !== specId))
      })
  }

  return (
    <div className="space-y-8">
        {templates.map(template => (
            <div key={template.id} className="border rounded-lg bg-card overflow-hidden">
                <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                    <h3 className="font-semibold">{template.label}</h3>
                    <button 
                        onClick={() => { setActiveElementKey(template.key); setIsPickerOpen(true); }}
                        className="text-xs flex items-center gap-1 bg-white border px-2 py-1 rounded hover:bg-gray-50"
                    >
                        <FaPlus /> Add Option
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    {specsByElement[template.key]?.map(spec => (
                        <div key={spec.id} className="flex items-start gap-4 p-3 border rounded-md bg-white">
                            {/* Image */}
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                                {spec.product.media?.[0]?.url && (
                                    <img src={spec.product.media[0].url} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{spec.product.name}</div>
                                <div className="text-xs text-muted-foreground">{spec.product.vendor?.name}</div>
                                {spec.variant && <div className="text-xs text-muted-foreground mt-1">Variant: {spec.variant.name}</div>}
                            </div>

                            {/* Tagging */}
                            <div className="w-32">
                                <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                    <FaTag size={10} /> Project Tag
                                </label>
                                <div className="relative">
                                    <input 
                                        className={`w-full text-xs border rounded px-2 py-1 ${spec.tagConflict ? 'border-red-500 bg-red-50' : ''}`}
                                        value={spec.projectTag || ''}
                                        onChange={(e) => handleUpdateTag(spec.id, e.target.value)}
                                        placeholder="e.g. T-01"
                                    />
                                    {spec.tagConflict && (
                                        <div className="absolute -top-2 -right-2 text-red-500" title="Tag Conflict: This tag is used for different products!">
                                            <FaExclamationTriangle />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <button onClick={() => handleDelete(spec.id)} className="text-gray-400 hover:text-red-500">
                                &times;
                            </button>
                        </div>
                    ))}
                    {!specsByElement[template.key]?.length && (
                        <div className="text-sm text-muted-foreground italic text-center py-2">No selections yet.</div>
                    )}
                </div>
            </div>
        ))}
        
        {templates.length === 0 && <div className="text-center text-muted-foreground">No templates defined for this room type. Configure templates in Settings.</div>}

        {isPickerOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white w-full max-w-2xl h-[80vh] rounded-lg shadow-xl flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-bold">Select Product</h3>
                        <button onClick={() => setIsPickerOpen(false)}>&times;</button>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        <CatalogPicker onSelect={handleAddSpec} />
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}
