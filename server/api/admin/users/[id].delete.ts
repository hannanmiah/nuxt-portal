import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const currentUser = await requireMinRole(event, 'admin')
  const id = getRouterParam(event, 'id') as string

  if (currentUser.id === id) {
    throw createError({ statusCode: 400, message: 'Cannot delete your own account' })
  }

  const [user] = await db.select().from(schema.user).where(eq(schema.user.id, id)).limit(1)
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  await db.delete(schema.user).where(eq(schema.user.id, id))
  return { message: 'User deleted successfully' }
})
