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
    <aside className="w-64 bg-[#1a1a1a] text-white flex flex-col h-screen border-r border-white/10 flex-shrink-0">
      {/* Header */}
      <div className="p-6 flex items-center gap-3">
         <div className="h-8 w-8 bg-white/10 rounded flex items-center justify-center">
             <FaBuilding />
         </div>
         <h1 className="text-xl font-bold tracking-tight text-white">
             {tenantName || 'JL Coates'}
         </h1>
      </div>

      {/* Scrollable Nav */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
        
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
      <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                  U
              </div>
              <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium truncate">User Profile</div>
                  <div className="text-xs text-gray-400 truncate">user@example.com</div>
              </div>
          </div>
      </div>
    </aside>
  )
}

function NavSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
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
                group flex items-center gap-3 px-2 py-1.5 text-sm font-medium rounded-md transition-colors
                ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
            `}
        >
            <span className={`${active ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                {icon}
            </span>
            {label}
        </Link>
    )
}

