import { db, schema } from '@nuxthub/db'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireMinRole(event, 'admin')
  const users = await db.select({
    id: schema.user.id,
    name: schema.user.name,
    email: schema.user.email,
    avatar: schema.user.image,
    role: (schema.user as any).role,
    createdAt: schema.user.createdAt,
  }).from(schema.user).orderBy(asc(schema.user.createdAt))
  return users
})
