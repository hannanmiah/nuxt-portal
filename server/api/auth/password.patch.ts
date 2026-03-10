import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as any).id as number
  const { currentPassword, newPassword } = await readBody(event)

  if (!currentPassword || !newPassword) {
    throw createError({ statusCode: 400, message: 'Current and new passwords are required' })
  }
  if (currentPassword === newPassword) {
    throw createError({ statusCode: 400, message: 'New password must differ from current password' })
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1)
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  const valid = await verifyPassword(user.password, currentPassword)
  if (!valid) {
    throw createError({ statusCode: 401, message: 'Current password is incorrect' })
  }

  await db.update(schema.users).set({
    password: await hashPassword(newPassword),
  }).where(eq(schema.users.id, userId))

  return { message: 'Password updated successfully' }
})
