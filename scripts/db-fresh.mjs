import { rmSync, existsSync } from 'fs'
import { join } from 'path'

const dbFile = join(process.cwd(), '.data', 'db', 'sqlite.db')
const migrationsDir = join(process.cwd(), '.data', 'db', 'migrations')

if (existsSync(dbFile)) {
  rmSync(dbFile)
  console.log('🗑  Dropped database:', dbFile)
} else {
  console.log('ℹ  No database found at:', dbFile)
}

if (existsSync(migrationsDir)) {
  rmSync(migrationsDir, { recursive: true, force: true })
  console.log('🗑  Cleared migrations state:', migrationsDir)
} else {
  console.log('ℹ  No migrations state found at:', migrationsDir)
}

console.log('')
console.log('✅ Done. Run `pnpm dev` to apply migrations and seed the database.')
