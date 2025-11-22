import { getCurrentTenant } from "@/lib/tenant"
import { updateTenant } from "../actions"

export default async function TenantSettingsPage() {
  const tenant = await getCurrentTenant()

  if (!tenant) return <div>Tenant not found</div>

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Tenant Settings</h1>
      <form action={updateTenant} className="space-y-4">
        <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Studio Name</label>
            <input 
                type="text" 
                name="name" 
                id="name" 
                defaultValue={tenant.name}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
        </div>
        <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-1">URL Slug</label>
            <input 
                type="text" 
                name="slug" 
                id="slug" 
                defaultValue={tenant.slug}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
        </div>
        <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            Save Changes
        </button>
      </form>
    </div>
  )
}
