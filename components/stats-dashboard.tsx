"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { revalidateStats } from "@/app/actions"

type Stats = {
  id: number
  name: string
  totalVisits: number
  uniqueVisitors: number
  bounceRate: number
  avgSessionDuration: number
}

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFrom, setActiveFrom] = useState<string | null>(null)

  const fetchStats = useCallback(async (from: string | null = null) => {
    setLoading(true)
    try {
      const url = from ? `/api/stats?from=${from}` : "/api/stats"
      const res = await fetch(url)
      const data = await res.json()
      setStats(Array.isArray(data) ? data[0] : data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats(null)
  }, [fetchStats])

  async function handleRefresh() {
    await revalidateStats()
    await fetchStats(activeFrom)
  }

  async function handleFromTest(from: string | null) {
    setActiveFrom(from)
    await fetchStats(from)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Stats Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => revalidateStats()} size="sm" variant="outline">
            Revalidate
          </Button>
          <Button onClick={handleRefresh} disabled={loading} size="sm">
            {loading ? "Chargement…" : "Actualiser"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Test from :</span>
        {([null, "1", "2"] as const).map((from) => (
          <Button
            key={String(from)}
            size="xs"
            variant={activeFrom === from ? "default" : "outline"}
            onClick={() => handleFromTest(from)}
            disabled={loading}
          >
            {from === null ? "sans from" : `from=${from}`}
          </Button>
        ))}
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Visites totales"
            value={stats.totalVisits.toLocaleString()}
          />
          <StatCard
            label="Visiteurs uniques"
            value={stats.uniqueVisitors.toLocaleString()}
          />
          <StatCard
            label="Taux de rebond"
            value={`${(stats.bounceRate * 100).toFixed(0)}%`}
          />
          <StatCard
            label="Durée moy. session"
            value={`${stats.avgSessionDuration}s`}
          />
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}
