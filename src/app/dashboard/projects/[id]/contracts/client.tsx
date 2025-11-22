'use client'

import { useState } from 'react'
import { FaPlus, FaFileContract } from 'react-icons/fa'
import { Contract, ContractTemplate, Amendment } from '@prisma/client'

type ContractWithAmendments = Contract & { amendments: Amendment[] }

export default function ContractsClient({ projectId, initialContracts, templates }: { projectId: string, initialContracts: ContractWithAmendments[], templates: ContractTemplate[] }) {
  const [contracts, setContracts] = useState(initialContracts)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const handleCreateContract = async (e: React.FormEvent) => {
      e.preventDefault()
      const form = e.target as HTMLFormElement
      const data = {
          title: (form.elements.namedItem('title') as HTMLInputElement).value,
          templateId: selectedTemplate || null,
          billingModel: (form.elements.namedItem('billingModel') as HTMLSelectElement).value,
          baseHoursAllocated: parseFloat((form.elements.namedItem('hours') as HTMLInputElement).value) || null,
          baseFlatAmount: parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value) || null,
      }

      const res = await fetch(`/api/projects/${projectId}/contracts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      })
      const newContract = await res.json()
      setContracts([newContract, ...contracts])
      setIsNewOpen(false)
  }

  return (
    <div className="space-y-8">
        <button 
            onClick={() => setIsNewOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
        >
            <FaPlus /> Create Contract
        </button>

        {isNewOpen && (
            <div className="bg-card border rounded-lg p-6 shadow-sm max-w-xl">
                <h3 className="font-semibold mb-4">New Contract</h3>
                <form onSubmit={handleCreateContract} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input name="title" placeholder="e.g. Design Services Agreement" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Template</label>
                        <select 
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            value={selectedTemplate}
                            onChange={e => setSelectedTemplate(e.target.value)}
                        >
                            <option value="">No Template (Blank)</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Billing Model</label>
                        <select name="billingModel" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                            <option value="hourly">Hourly</option>
                            <option value="flat_rate">Flat Rate</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Base Hours</label>
                            <input name="hours" type="number" step="0.5" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Base Amount ($)</label>
                            <input name="amount" type="number" step="0.01" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setIsNewOpen(false)} className="px-4 py-2 text-sm hover:bg-muted rounded-md">Cancel</button>
                        <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">Create</button>
                    </div>
                </form>
            </div>
        )}

        <div className="space-y-4">
            {contracts.map((contract: ContractWithAmendments) => (
                <div key={contract.id} className="border rounded-lg bg-card overflow-hidden">
                    <div className="p-6 border-b bg-muted/10 flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <FaFileContract className="text-primary"/> {contract.title}
                            </h3>
                            <div className="text-sm text-muted-foreground mt-1 capitalize">
                                {contract.status} • {contract.billingModel.replace('_', ' ')} 
                                {contract.baseHoursAllocated && ` • ${contract.baseHoursAllocated} hrs`}
                                {contract.baseFlatAmount && ` • $${contract.baseFlatAmount}`}
                            </div>
                        </div>
                        {/* Add buttons for View/Edit/Send later */}
                    </div>
                    
                    {contract.amendments?.length > 0 && (
                        <div className="p-4 bg-gray-50">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Amendments</h4>
                            <ul className="space-y-2">
                                {contract.amendments.map((amend: Amendment) => (
                                    <li key={amend.id} className="text-sm flex justify-between border-b pb-1 last:border-0">
                                        <span>{amend.title}</span>
                                        <span className="text-muted-foreground">
                                            {amend.extraHoursAllocated && `+${amend.extraHoursAllocated}h`}
                                            {amend.extraFlatAmount && ` +$${amend.extraFlatAmount}`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
            {contracts.length === 0 && <div className="text-center text-muted-foreground py-8">No contracts created yet.</div>}
        </div>
    </div>
  )
}
