/**
 * Triggers the Nitro seed task via HTTP.
 * Run while `pnpm dev` is running: node scripts/db-seed.mjs
 */
const url = process.env.NUXT_URL
  ? `${process.env.NUXT_URL}/_nitro/tasks/seed:run`
  : 'http://localhost:3000/_nitro/tasks/seed:run'

console.log('🌱 Running seed task...')

const res = await fetch(url, { method: 'POST' })

if (!res.ok) {
  console.error(`❌ Task failed: HTTP ${res.status}`)
  const text = await res.text()
  console.error(text)
  process.exit(1)
}

const json = await res.json()
const message = json?.result?.result ?? JSON.stringify(json, null, 2)
console.log(message)
