import { getCurrentTenant } from "@/lib/tenant"
import { updateTheme } from "../actions"

export default async function ThemeSettingsPage() {
  const tenant = await getCurrentTenant()

  if (!tenant) return <div>Tenant not found</div>

  // Fallback theme values if none exist
  const theme = tenant.theme || {
      primaryColor: "#3b82f6",
      secondaryColor: "#f1f5f9",
      accentColor: "#f1f5f9",
      bgColor: "#ffffff",
      textColor: "#171717",
      borderRadius: "0.5rem"
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Theme Settings</h1>
      <form action={updateTheme} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium mb-1">Primary Color</label>
                <div className="flex gap-2">
                    <input type="color" name="primaryColor" defaultValue={theme.primaryColor} className="h-9 w-9 rounded border" />
                    <input type="text" name="primaryColor" defaultValue={theme.primaryColor} className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
            </div>
            <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium mb-1">Secondary Color</label>
                 <div className="flex gap-2">
                    <input type="color" name="secondaryColor" defaultValue={theme.secondaryColor} className="h-9 w-9 rounded border" />
                    <input type="text" name="secondaryColor" defaultValue={theme.secondaryColor} className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
            </div>
            <div>
                <label htmlFor="accentColor" className="block text-sm font-medium mb-1">Accent Color</label>
                 <div className="flex gap-2">
                    <input type="color" name="accentColor" defaultValue={theme.accentColor} className="h-9 w-9 rounded border" />
                    <input type="text" name="accentColor" defaultValue={theme.accentColor} className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
            </div>
            <div>
                <label htmlFor="bgColor" className="block text-sm font-medium mb-1">Background Color</label>
                 <div className="flex gap-2">
                    <input type="color" name="bgColor" defaultValue={theme.bgColor} className="h-9 w-9 rounded border" />
                    <input type="text" name="bgColor" defaultValue={theme.bgColor} className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
            </div>
            <div>
                <label htmlFor="textColor" className="block text-sm font-medium mb-1">Text Color</label>
                 <div className="flex gap-2">
                    <input type="color" name="textColor" defaultValue={theme.textColor} className="h-9 w-9 rounded border" />
                    <input type="text" name="textColor" defaultValue={theme.textColor} className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
            </div>
             <div>
                <label htmlFor="borderRadius" className="block text-sm font-medium mb-1">Border Radius</label>
                <select name="borderRadius" defaultValue={theme.borderRadius} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                    <option value="0rem">None</option>
                    <option value="0.25rem">Small</option>
                    <option value="0.5rem">Medium</option>
                    <option value="0.75rem">Large</option>
                    <option value="1rem">Extra Large</option>
                </select>
            </div>
        </div>

        <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            Save Theme
        </button>
      </form>
    </div>
  )
}
