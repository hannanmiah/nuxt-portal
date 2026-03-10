import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const currentUser = await requireMinRole(event, 'admin')
  const id = Number(getRouterParam(event, 'id'))

  if (currentUser.id === id) {
    throw createError({ statusCode: 400, message: 'Cannot delete your own account' })
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1)
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  await db.delete(schema.users).where(eq(schema.users.id, id))
  return { message: 'User deleted successfully' }
})
