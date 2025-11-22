'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FaSearch, FaBook, FaPlay } from 'react-icons/fa'

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<any>(null)

  const { data: articles } = useQuery({
      queryKey: ['help-articles'],
      queryFn: () => fetch('/api/help/articles').then(res => res.json())
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredArticles = articles?.filter((a: any) => 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.body.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
        <div className="lg:col-span-1 border rounded-lg bg-card p-4 flex flex-col">
            <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-3 text-muted-foreground" />
                <input 
                    placeholder="Search help..." 
                    className="w-full pl-9 pr-3 py-2 border rounded-md text-sm bg-transparent"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {filteredArticles?.map((article: any) => (
                    <button 
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className={`w-full text-left p-3 rounded-md text-sm flex items-center gap-2 ${selectedArticle?.id === article.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                    >
                        <FaBook className="text-muted-foreground" /> {article.title}
                    </button>
                ))}
                {filteredArticles?.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No articles found.</p>}
            </div>
        </div>

        <div className="lg:col-span-2 border rounded-lg bg-card p-8 overflow-y-auto">
            {selectedArticle ? (
                <article className="prose max-w-none">
                    <h1>{selectedArticle.title}</h1>
                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.body }} /> {/* Assuming safe HTML or render markdown here */}
                </article>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <FaBook size={48} className="mb-4 opacity-20" />
                    <p>Select an article to view</p>
                </div>
            )}
        </div>
    </div>
  )
}
