'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FaHome, FaProjectDiagram, FaUserFriends, FaCalendarAlt, FaTasks, 
  FaLightbulb, FaRocket, FaLayerGroup, FaHammer, FaCouch, FaLeaf, 
  FaMountain, FaBook, FaShareAlt, FaBullhorn, FaBuilding, FaChevronDown, FaChevronRight
} from 'react-icons/fa'
import { useState } from 'react'

export function AppSidebar({ tenantName }: { tenantName: string }) {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 bg-white border-r border-[#E8E8E8] flex flex-col h-screen flex-shrink-0">
      {/* Header */}
      <div className="p-5 flex items-center gap-3 border-b border-[#E8E8E8]">
         <div className="h-9 w-9 bg-primary/10 rounded-md flex items-center justify-center text-primary">
             <FaBuilding className="text-sm" />
         </div>
         <h1 className="text-base font-semibold tracking-tight text-foreground">
             {tenantName || 'JL Coates'}
         </h1>
      </div>

      {/* Scrollable Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        
        {/* Main Section */}
        <NavSection title="DASH.">
            <NavItem href="/dashboard" icon={<FaHome />} label="Overview" active={pathname === '/dashboard'} />
            <NavItem href="/dashboard/projects" icon={<FaProjectDiagram />} label="Projects" active={pathname.startsWith('/dashboard/projects')} />
            <NavItem href="/dashboard/clients" icon={<FaUserFriends />} label="Clients" active={pathname.startsWith('/dashboard/clients')} />
            <NavItem href="/dashboard/leads" icon={<FaShareAlt />} label="Leads" />
            <NavItem href="/dashboard/meetings" icon={<FaCalendarAlt />} label="Meetings" />
            <NavItem href="/dashboard/tasks" icon={<FaTasks />} label="Tasks" />
        </NavSection>

        {/* Onboarding */}
        <NavSection title="Onboarding">
            <NavItem href="/dashboard/inspiration" icon={<FaLightbulb />} label="Inspiration" />
            <NavItem href="/dashboard/kickoff" icon={<FaRocket />} label="Kick-Off" />
        </NavSection>

        {/* Catalog */}
        <NavSection title="Catalog">
             <NavItem href="/dashboard/inventory/finishes" icon={<FaLayerGroup />} label="Finishes" />
             <NavItem href="/dashboard/inventory/fixtures" icon={<FaHammer />} label="Fixtures" />
             <NavItem href="/dashboard/inventory/furnishings" icon={<FaCouch />} label="Furnishings" />
             <NavItem href="/dashboard/inventory/interiors" icon={<FaLeaf />} label="Interiors" />
             <NavItem href="/dashboard/inventory/exteriors" icon={<FaMountain />} label="Exteriors" />
        </NavSection>

        {/* Resources */}
        <NavSection title="Resources">
            <NavItem href="/dashboard/resources" icon={<FaBook />} label="Resources" />
            <NavItem href="/dashboard/marketing" icon={<FaBullhorn />} label="Social Media + Marketing" />
            <NavItem href="/dashboard/outreach" icon={<FaShareAlt />} label="Outreach" />
        </NavSection>
        
        {/* Settings & Tools */}
        <NavSection title="System">
             <NavItem href="/dashboard/settings" icon={<FaHammer />} label="Settings" active={pathname.startsWith('/dashboard/settings')} />
             <NavItem href="/dashboard/settings/theme/style-guide" icon={<FaLayerGroup />} label="Style Guide" active={pathname.includes('style-guide')} />
        </NavSection>

      </div>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-[#E8E8E8] bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-xs font-semibold text-white">
                  U
              </div>
              <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium truncate text-foreground">User Profile</div>
                  <div className="text-xs text-muted-foreground truncate">user@example.com</div>
              </div>
          </div>
      </div>
    </aside>
  )
}

function NavSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</h3>
            <div className="space-y-0.5">
                {children}
            </div>
        </div>
    )
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link 
            href={href} 
            className={`
                group flex items-center gap-3 px-2.5 py-2 text-sm font-medium rounded-md transition-all duration-150
                ${active 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-muted-foreground hover:bg-[#F7F7F7] hover:text-foreground'
                }
            `}
        >
            <span className={`text-sm ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                {icon}
            </span>
            <span>{label}</span>
        </Link>
    )
}

