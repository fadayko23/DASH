'use client'

import { getCurrentTenant } from "@/lib/tenant"
import { StatusBadge } from "@/components/ui/status-badge"
import { DataCard } from "@/components/ui/data-card"
import { FaProjectDiagram, FaUserFriends, FaBoxOpen } from "react-icons/fa"

export default function StyleGuidePage() {
  
  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
        <p className="text-xl text-muted-foreground">
          A reference guide for the application's design tokens, typography, and core components.
          Changes in the Theme Settings will be reflected here immediately.
        </p>
      </div>

      {/* Colors */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Primary" variable="var(--primary)" />
          <ColorSwatch name="Secondary" variable="var(--secondary)" textColor="var(--secondary-foreground)" />
          <ColorSwatch name="Accent" variable="var(--accent)" textColor="var(--accent-foreground)" />
          <ColorSwatch name="Muted" variable="var(--muted)" textColor="var(--muted-foreground)" />
          <ColorSwatch name="Background" variable="var(--background)" textColor="var(--foreground)" border />
          <ColorSwatch name="Card" variable="var(--card)" textColor="var(--card-foreground)" border />
          <ColorSwatch name="Destructive" variable="var(--destructive)" textColor="var(--destructive-foreground)" />
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Typography</h2>
        <div className="space-y-8 p-6 border rounded-lg bg-card">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <span className="text-muted-foreground text-sm">Display / H1</span>
              <h1 className="text-4xl font-bold tracking-tight col-span-2">The quick brown fox</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <span className="text-muted-foreground text-sm">Heading / H2</span>
              <h2 className="text-3xl font-bold tracking-tight col-span-2">Jumps over the lazy dog</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <span className="text-muted-foreground text-sm">Heading / H3</span>
              <h3 className="text-2xl font-semibold tracking-tight col-span-2">Design System Variables</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <span className="text-muted-foreground text-sm">Body / Large</span>
              <p className="text-lg col-span-2">
                Dashboard interfaces require high legibility and clear hierarchy. 
                This is the lead paragraph style.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <span className="text-muted-foreground text-sm">Body / Base</span>
              <p className="col-span-2">
                Standard body text used for most content. Efficient, readable, and balanced. 
                Consistent vertical rhythm is key to a polished interface.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <span className="text-muted-foreground text-sm">Small / Muted</span>
              <p className="text-sm text-muted-foreground col-span-2">
                Metadata, captions, and secondary information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Components */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold border-b pb-2">Components</h2>
        
        {/* Buttons */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Buttons</h3>
          <div className="flex flex-wrap gap-4 p-6 border rounded-lg bg-card items-center">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 font-medium text-sm">
              Primary Button
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 font-medium text-sm">
              Secondary Button
            </button>
            <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 font-medium text-sm">
              Destructive
            </button>
            <button className="text-primary hover:underline font-medium text-sm px-4 py-2">
              Link Button
            </button>
            <button disabled className="bg-primary/50 text-primary-foreground px-4 py-2 rounded-md cursor-not-allowed font-medium text-sm">
              Disabled
            </button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Status Badges</h3>
          <div className="flex flex-wrap gap-4 p-6 border rounded-lg bg-card">
            <StatusBadge status="active" />
            <StatusBadge status="prospect" />
            <StatusBadge status="completed" />
            <StatusBadge status="on_hold" />
            <StatusBadge status="documentation" />
            <StatusBadge status="design_oversight" />
          </div>
        </div>

        {/* Form Elements */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Form Elements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-card">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input type="email" placeholder="hello@example.com" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
               <label className="text-sm font-medium">Project Type</label>
               <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                 <option>Residential</option>
                 <option>Commercial</option>
               </select>
            </div>
          </div>
        </div>

        {/* Data Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Data Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DataCard 
              title="Active Projects" 
              value="12" 
              subtext="+2 from last month" 
              icon={<FaProjectDiagram />} 
            />
            <DataCard 
              title="Total Clients" 
              value="48" 
              href="#"
              icon={<FaUserFriends />} 
            />
            <DataCard 
              title="Inventory Items" 
              subtext="View full catalog"
              href="#"
              icon={<FaBoxOpen />} 
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function ColorSwatch({ name, variable, textColor = '#fff', border = false }: { name: string, variable: string, textColor?: string, border?: boolean }) {
  return (
    <div className="space-y-2">
      <div 
        className={`h-20 rounded-md shadow-sm flex items-center justify-center text-xs font-medium ${border ? 'border' : ''}`}
        style={{ backgroundColor: variable, color: textColor }}
      >
        {name}
      </div>
      <div className="text-xs text-muted-foreground font-mono text-center">{variable}</div>
    </div>
  )
}

