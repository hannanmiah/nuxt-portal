import { db, schema } from '@nuxthub/db'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireMinRole(event, 'admin')
  const users = await db.select({
    id: schema.users.id,
    name: schema.users.name,
    email: schema.users.email,
    avatar: schema.users.avatar,
    role: schema.users.role,
    createdAt: schema.users.createdAt,
  }).from(schema.users).orderBy(asc(schema.users.createdAt))
  return users
})
