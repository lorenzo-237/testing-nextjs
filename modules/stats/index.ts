import { readFileSync } from "fs"
import { cacheLife, cacheTag } from "next/cache"
import { join } from "path"

export async function getCachedStats(from: string | null, to: string | null) {
  "use cache"
  cacheTag("stats")
  cacheLife("days")
  return db_stats(from, to)
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
