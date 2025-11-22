'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaPlus, FaMagic } from 'react-icons/fa'

export function AddProductButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<'single' | 'list'>('single')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleScrape = async () => {
    setIsLoading(true)
    try {
        const res = await fetch('/api/catalog/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, mode })
        })
        const data = await res.json()
        if (data.success) {
            setIsOpen(false)
            router.refresh()
            alert('Product scraped and added successfully!')
        } else {
            alert('Failed: ' + data.error)
        }
    } catch (e) {
        console.error(e)
        alert('Error scraping')
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
      >
        <FaPlus /> Add Product
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground p-6 rounded-lg w-full max-w-md border shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FaMagic className="text-purple-500"/> AI Import
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">URL</label>
                        <input 
                            type="url" 
                            value={url} 
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/product"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input 
                                type="radio" 
                                checked={mode === 'single'} 
                                onChange={() => setMode('single')}
                            />
                            Single Product
                        </label>
                        <label className="flex items-center gap-2 text-muted-foreground cursor-not-allowed">
                             <input 
                                type="radio" 
                                checked={mode === 'list'} 
                                disabled
                                // onChange={() => setMode('list')}
                            />
                            Listing (Coming Soon)
                        </label>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm hover:bg-muted rounded-md"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleScrape}
                            disabled={isLoading || !url}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isLoading ? 'Importing...' : 'Import'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  )
}
