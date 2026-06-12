import { readFileSync } from "fs"
import { cacheLife, cacheTag } from "next/cache"
import { join } from "path"

export async function getCachedStats(from: string | null, to: string | null) {
  "use cache: remote"
  cacheTag("stats")
  cacheLife("days")
  return test_stats(from, to)
}

const seconds = 3

async function db_stats(from: string | null, to: string | null) {
  await new Promise((resolve) => setTimeout(resolve, 1000 * seconds))
  let filePath = join(process.cwd(), "data", "stats.json")
  if (from === "1") {
    filePath = join(process.cwd(), "data", "stats_test.json")
  } else if (from === "2") {
    filePath = join(process.cwd(), "data", "stats_x.json")
  }
  const raw = readFileSync(filePath, "utf-8")
  return JSON.parse(raw)
}

async function test_stats(from: string | null, to: string | null) {
  await new Promise((resolve) => setTimeout(resolve, 1000 * seconds))

  if (from === "1") {
    return [
      {
        id: 1,
        name: "lorenzo",
        totalVisits: 1240,
        uniqueVisitors: 870,
        bounceRate: 0.34,
        avgSessionDuration: 185,
      },
    ]
  } else if (from === "2") {
    return [
      {
        id: 1,
        name: "lorenzo",
        totalVisits: 10000,
        uniqueVisitors: 10000,
        bounceRate: 0.34,
        avgSessionDuration: 185,
      },
    ]
  } else {
    return [
      {
        id: 1,
        name: "lorenzo",
        totalVisits: 1000,
        uniqueVisitors: 100,
        bounceRate: 0.34,
        avgSessionDuration: 185,
      },
    ]
  }
}
