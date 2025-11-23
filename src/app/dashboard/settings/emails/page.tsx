'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FaEdit, FaEye, FaPlus, FaTrash } from 'react-icons/fa'

export default function EmailSettingsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  const { data: templates, refetch } = useQuery({
      queryKey: ['email-templates'],
      queryFn: () => fetch('/api/settings/email-templates').then(res => res.json())
  })

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault()
      const method = selectedTemplate.id ? 'PUT' : 'POST'
      const url = selectedTemplate.id 
          ? `/api/settings/email-templates/${selectedTemplate.id}`
          : '/api/settings/email-templates'

      await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedTemplate)
      })
      setIsEditing(false)
      setSelectedTemplate(null)
      refetch()
  }

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure?")) return
      await fetch(`/api/settings/email-templates/${id}`, { method: 'DELETE' })
      refetch()
  }

  const renderPreview = (html: string) => {
      // Simple mock data replacement for preview
      let preview = html
      const mockData: any = {
          clientName: "Jane Doe",
          projectName: "Downtown Loft",
          milestoneName: "Concept Approval",
          amount: "5000.00"
      }
      for (const [k, v] of Object.entries(mockData)) {
          preview = preview.split(`{{${k}}}`).join(v as string)
      }
      return preview
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
            <button 
                onClick={() => { setSelectedTemplate({ key: '', name: '', subject: '', htmlBody: '' }); setIsEditing(true) }}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
            >
                <FaPlus /> New Template
            </button>
        </div>

        {isEditing && selectedTemplate ? (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
                <div className="bg-card border rounded-lg p-6 shadow-sm overflow-y-auto">
                    <h3 className="font-semibold mb-4">{selectedTemplate.id ? 'Edit Template' : 'New Template'}</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Key (Unique ID)</label>
                            <input 
                                value={selectedTemplate.key} 
                                onChange={e => setSelectedTemplate({...selectedTemplate, key: e.target.value})}
                                disabled={!!selectedTemplate.id}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm disabled:opacity-50" 
                                placeholder="e.g. welcome_email"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input 
                                value={selectedTemplate.name} 
                                onChange={e => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" 
                                placeholder="Internal Name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Subject</label>
                            <input 
                                value={selectedTemplate.subject} 
                                onChange={e => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" 
                                placeholder="Email Subject"
                                required
                            />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="block text-sm font-medium mb-1">HTML Body</label>
                            <textarea 
                                value={selectedTemplate.htmlBody} 
                                onChange={e => setSelectedTemplate({...selectedTemplate, htmlBody: e.target.value})}
                                className="w-full flex-1 min-h-[300px] rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono" 
                                placeholder="<h1>Hello {{clientName}}</h1>..."
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-2">Available placeholders: {'{{clientName}}'}, {'{{projectName}}'}, {'{{milestoneName}}'}, {'{{amount}}'}</p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => { setIsEditing(false); setSelectedTemplate(null) }} className="px-4 py-2 text-sm hover:bg-muted rounded-md">Cancel</button>
                            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">Save</button>
                        </div>
                    </form>
                </div>

                <div className="bg-card border rounded-lg shadow-sm flex flex-col">
                    <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
                        <span className="text-sm font-medium flex items-center gap-2"><FaEye /> Live Preview</span>
                        <span className="text-xs text-muted-foreground">Mock Data Applied</span>
                    </div>
                    <div className="flex-1 p-6 bg-white rounded-b-lg overflow-y-auto">
                        <div className="mb-4 pb-4 border-b">
                            <p className="text-sm text-muted-foreground">Subject:</p>
                            <p className="font-medium">{renderPreview(selectedTemplate.subject)}</p>
                        </div>
                        <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: renderPreview(selectedTemplate.htmlBody) }}
                        />
                    </div>
                </div>
             </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {templates?.map((t: any) => (
                    <div key={t.id} className="border rounded-lg p-4 bg-card hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold">{t.name}</h3>
                                <code className="text-xs bg-muted px-1 rounded text-muted-foreground">{t.key}</code>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setSelectedTemplate(t); setIsEditing(true) }} className="text-muted-foreground hover:text-primary">
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDelete(t.id)} className="text-muted-foreground hover:text-destructive">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">Subject: {t.subject}</p>
                    </div>
                ))}
                {templates?.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No templates found. Create one to get started.</p>}
            </div>
        )}
    </div>
  )
}
