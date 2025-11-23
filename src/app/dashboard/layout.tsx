import React from 'react'
import { getCurrentTenant } from "@/lib/tenant"
import { ThemeProvider } from "@/components/theme-provider"
import WalkthroughOverlay from '@/components/WalkthroughOverlay'
import { AppSidebar } from '@/components/app-sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant()

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {tenant?.theme && <ThemeProvider theme={tenant.theme} />}
        <WalkthroughOverlay />
        
        {/* Sidebar */}
        <AppSidebar tenantName={tenant?.name || 'DASH'} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-muted/10 relative">
            {children}
        </main>
    </div>
  )
}
