import React from 'react'
import Link from 'next/link'
import { signOut } from "@/auth"

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Minimal Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <h1 className="text-xl font-bold text-gray-900">Client Portal</h1>
                    <nav className="hidden md:flex gap-4">
                        <Link href="/client" className="text-sm font-medium text-gray-500 hover:text-gray-900">Dashboard</Link>
                        <Link href="/client/messages" className="text-sm font-medium text-gray-500 hover:text-gray-900">Messages</Link>
                    </nav>
                </div>
                
                <form action={async () => {
                    'use server'
                    await signOut()
                }}>
                    <button type="submit" className="text-sm text-gray-500 hover:text-gray-900">Sign out</button>
                </form>
            </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {children}
        </main>
    </div>
  )
}
