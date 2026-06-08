import { NextRequest, NextResponse } from "next/server"
import { getCachedStats } from "@/modules/stats"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const from = req.nextUrl.searchParams.get("from")
  const to = req.nextUrl.searchParams.get("to")
  try {
    const stats = await getCachedStats(from, to)
    return NextResponse.json(stats)
  } catch (err) {
    console.error("GET /api/stats", err)
    return NextResponse.json([])
  }
}
