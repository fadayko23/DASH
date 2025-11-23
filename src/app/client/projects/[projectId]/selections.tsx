/* eslint-disable @next/next/no-img-element */
'use client'

import { updateSelectionStatus } from './actions'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { ProjectProduct, Product, ProductVariant, ProductMedia, Space, Vendor } from '@prisma/client'

type SelectionWithDetails = ProjectProduct & {
    product: Product & { media: ProductMedia[]; vendor: Vendor | null };
    variant: ProductVariant | null;
    space: Space;
}

export default function ClientSelections({ selections, spaces }: { selections: SelectionWithDetails[], spaces: Space[] }) {
  // Group by space
  const bySpace = spaces.map(space => ({
      ...space,
      items: selections.filter(s => s.spaceId === space.id)
  })).filter(g => g.items.length > 0)

  const handleStatus = async (id: string, status: 'approved' | 'declined') => {
      await updateSelectionStatus(id, status)
      window.location.reload() // Simple reload to refresh data
  }

  return (
    <div className="space-y-8">
        {bySpace.map(group => (
            <div key={group.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                    <h3 className="font-semibold text-lg">{group.name}</h3>
                </div>
                <div className="divide-y">
                    {group.items.map((item) => (
                        <div key={item.id} className="p-6 flex gap-6">
                            {/* Image */}
                            <div className="w-32 h-32 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                                {item.product.media?.[0]?.url && (
                                    <img src={item.product.media[0].url} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-lg">{item.product.name}</h4>
                                        <p className="text-sm text-gray-500">{item.elementLabel}</p>
                                        {item.variant && <p className="text-sm text-gray-500 mt-1">Option: {item.variant.name}</p>}
                                        {item.notes && <p className="text-sm text-gray-600 mt-2 italic">&quot;{item.notes}&quot;</p>}
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2">
                                        {item.clientStatus === 'approved' ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                                                <FaCheck size={12}/> Approved
                                            </span>
                                        ) : item.clientStatus === 'declined' ? (
                                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1">
                                                <FaTimes size={12}/> Declined
                                            </span>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleStatus(item.id, 'declined')}
                                                    className="px-3 py-1 border border-red-200 text-red-600 rounded-md hover:bg-red-50 text-sm"
                                                >
                                                    Decline
                                                </button>
                                                <button 
                                                    onClick={() => handleStatus(item.id, 'approved')}
                                                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
        {bySpace.length === 0 && <div className="text-center text-gray-500">No selections available for review at this time.</div>}
    </div>
  )
}
