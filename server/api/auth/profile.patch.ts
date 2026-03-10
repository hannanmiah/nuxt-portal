import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as any).id as number
  const { name, email, avatar } = await readBody(event)

  if (!name || !email) {
    throw createError({ statusCode: 400, message: 'Name and email are required' })
  }

  // Check email uniqueness if changed
  if (email !== (session.user as any).email) {
    const [conflict] = await db.select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1)
    if (conflict) {
      throw createError({ statusCode: 409, message: 'Email already in use' })
    }
  }

  const [updated] = await db.update(schema.users).set({
    name,
    email,
    ...(avatar !== undefined ? { avatar } : {}),
  }).where(eq(schema.users.id, userId)).returning({
    id: schema.users.id,
    name: schema.users.name,
    email: schema.users.email,
    avatar: schema.users.avatar,
    role: schema.users.role,
  })

  if (!updated) throw createError({ statusCode: 404, message: 'User not found' })

  // Refresh session with updated data
  await setUserSession(event, { user: updated })

  return updated
})
