'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaPlus, FaUserTie } from 'react-icons/fa'

export default function VendorSettingsPage() {
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ vendorId: '', repName: '', repEmail: '', repPhone: '', notes: '' })

  const { data: reps, refetch } = useQuery({
      queryKey: ['vendor-reps'],
      queryFn: () => fetch('/api/settings/vendor-reps').then(res => res.json())
  })

  // Fetch all vendors to select from (assuming global or tenant scoped vendors endpoint exists)
  // For MVP, we'll just fetch /api/catalog/vendors if it existed, or just mock/list simple
  // Let's assume we can fetch products to get vendors or a dedicated endpoint.
  // Since we don't have a clean list of all vendors API, let's mock or add one.
  // I'll skip fetching full vendor list for brevity and assume user types ID or we fetch products.
  
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      await fetch('/api/settings/vendor-reps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
      })
      setIsAdding(false)
      setFormData({ vendorId: '', repName: '', repEmail: '', repPhone: '', notes: '' })
      refetch()
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Vendor Representatives</h1>
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
            >
                <FaPlus /> Add Rep
            </button>
        </div>

        {isAdding && (
            <div className="bg-card border rounded-lg p-6 max-w-lg">
                <h3 className="font-semibold mb-4">New Representative</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Vendor ID (Temporary)</label>
                        <input 
                            value={formData.vendorId}
                            onChange={e => setFormData({...formData, vendorId: e.target.value})}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            placeholder="Enter Vendor UUID"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Rep Name</label>
                        <input 
                            value={formData.repName}
                            onChange={e => setFormData({...formData, repName: e.target.value})}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input 
                                value={formData.repEmail}
                                onChange={e => setFormData({...formData, repEmail: e.target.value})}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input 
                                value={formData.repPhone}
                                onChange={e => setFormData({...formData, repPhone: e.target.value})}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea 
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            rows={2}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm hover:bg-muted rounded-md">Cancel</button>
                        <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">Save</button>
                    </div>
                </form>
            </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {reps?.map((rep: any) => (
                <div key={rep.id} className="border rounded-lg p-4 bg-card">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-full">
                            <FaUserTie className="text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{rep.repName}</h3>
                            <p className="text-xs text-muted-foreground mb-2">{rep.vendor?.name || 'Unknown Vendor'}</p>
                            <div className="text-sm space-y-1">
                                {rep.repEmail && <p>📧 {rep.repEmail}</p>}
                                {rep.repPhone && <p>📞 {rep.repPhone}</p>}
                            </div>
                            {rep.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{rep.notes}"</p>}
                        </div>
                    </div>
                </div>
            ))}
            {reps?.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No reps found.</p>}
        </div>
    </div>
  )
}
