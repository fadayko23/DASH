import Link from 'next/link'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/settings/tenant" className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-accent transition-colors">
            <h3 className="text-lg font-semibold mb-2">Tenant Settings</h3>
            <p className="text-sm text-muted-foreground">Manage your studio name, slug, and logo.</p>
        </Link>
        <Link href="/dashboard/settings/theme" className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-accent transition-colors">
            <h3 className="text-lg font-semibold mb-2">Theme Settings</h3>
            <p className="text-sm text-muted-foreground">Customize colors, fonts, and styling.</p>
        </Link>
        <Link href="/dashboard/settings/integrations" className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-accent transition-colors">
            <h3 className="text-lg font-semibold mb-2">Integrations</h3>
            <p className="text-sm text-muted-foreground">Connect Google, Stripe, and other services.</p>
        </Link>
        <Link href="/dashboard/settings/room-templates" className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-accent transition-colors">
            <h3 className="text-lg font-semibold mb-2">Room Templates</h3>
            <p className="text-sm text-muted-foreground">Define standard elements for room types.</p>
        </Link>
      </div>
    </div>
  )
}
