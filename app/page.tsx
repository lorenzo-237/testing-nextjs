import { StatsDashboard } from "@/components/stats-dashboard"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="w-full max-w-lg">
        <StatsDashboard />
      </div>
    </div>
  )
}
