import React from 'react'
import { getCurrentTenant } from "@/lib/tenant"
import { ThemeProvider } from "@/components/theme-provider"
import WalkthroughOverlay from '@/components/WalkthroughOverlay'
import { AppSidebar } from '@/components/app-sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant()

  // Default theme with Montserrat font
  const defaultTheme = {
    primaryColor: "#3b82f6",
    secondaryColor: "#f1f5f9",
    accentColor: "#f1f5f9",
    bgColor: "#ffffff",
    textColor: "#171717",
    fontFamily: "Montserrat",
    borderRadius: "0.5rem",
    shadowPreset: "sm"
  }

  const theme = tenant?.theme || defaultTheme

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <ThemeProvider theme={theme} />
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
