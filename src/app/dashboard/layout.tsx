import React from 'react'
import Link from 'next/link'
import { signOut } from "@/auth"
import { getCurrentTenant } from "@/lib/tenant"
import { ThemeProvider } from "@/components/theme-provider"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant()

  return (
    <div className="flex h-screen bg-background text-foreground">
        {tenant?.theme && <ThemeProvider theme={tenant.theme} />}
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card hidden md:block">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-primary">
                    {tenant?.name || 'DASH'}
                </h1>
            </div>
            <nav className="mt-6 px-4 space-y-2">
                {['Dashboard', 'Clients', 'Projects', 'Inventory', 'Tasks', 'Settings'].map((item) => (
                    <Link
                        key={item}
                        href={`/dashboard${item === 'Dashboard' ? '' : '/' + item.toLowerCase()}`}
                        className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    >
                        {item}
                    </Link>
                ))}
            </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Topbar */}
            <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
                 <div className="md:hidden text-muted-foreground">Menu</div>
                 <div className="ml-auto flex items-center space-x-4">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                        U
                    </div>
                    <form action={async () => {
                        'use server'
                        await signOut()
                    }}>
                        <button type="submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Sign out
                        </button>
                    </form>
                 </div>
            </header>
            <main className="flex-1 overflow-auto p-6">
                {children}
            </main>
        </div>
    </div>
  )
}
