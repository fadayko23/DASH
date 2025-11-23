import { FaSpinner } from "react-icons/fa"

export default function DashboardLoading() {
  return (
    <div className="flex h-full items-center justify-center bg-muted/10">
      <div className="text-center space-y-4">
        <div className="animate-spin text-primary text-4xl mx-auto">
            <FaSpinner />
        </div>
        <p className="text-muted-foreground text-sm animate-pulse">Loading DASH...</p>
      </div>
    </div>
  )
}

