import { db, schema } from '@nuxthub/db'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireMinRole(event, 'admin')
  return await db.select().from(schema.categories).orderBy(asc(schema.categories.name))
})
