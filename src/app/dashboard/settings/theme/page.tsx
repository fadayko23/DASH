import { getCurrentTenant } from "@/lib/tenant"
import ThemeForm from "./theme-form"

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
      fontFamily: "Montserrat",
      borderRadius: "0.5rem"
  }

  // Ensure theme object matches ThemeForm type by filtering relevant keys
  const themeProps = {
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      bgColor: theme.bgColor,
      textColor: theme.textColor,
      fontFamily: theme.fontFamily || "Montserrat",
      borderRadius: theme.borderRadius,
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Theme Settings</h1>
        <a href="/dashboard/settings/theme/style-guide" className="text-sm text-primary hover:underline">
          View Style Guide
        </a>
      </div>
      <ThemeForm initialTheme={themeProps} />
    </div>
  )
}
