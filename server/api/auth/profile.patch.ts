import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const userId = user.id as string
  const { name, email, avatar } = await readBody(event)

  if (!name || !email) {
    throw createError({ statusCode: 400, message: 'Name and email are required' })
  }

  const auth = serverAuth()

  // Check email uniqueness if changed
  if (email !== user.email) {
    const [conflict] = await db.select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1)
    if (conflict) {
      throw createError({ statusCode: 409, message: 'Email already in use' })
    }
  }

  await auth.api.updateUser({
    body: { name, ...(avatar !== undefined ? { image: avatar } : {}) },
    headers: event.headers,
  })

  // Update email and avatar (custom field) directly if changed
  const updateFields: Record<string, unknown> = {}
  if (email !== user.email) updateFields.email = email
  if (avatar !== undefined) updateFields.avatar = avatar
  if (Object.keys(updateFields).length > 0) {
    await db.update(schema.user).set(updateFields).where(eq(schema.user.id, userId))
  }

  const [updated] = await db.select({
    id: schema.user.id,
    name: schema.user.name,
    email: schema.user.email,
    avatar: (schema.user as any).avatar,
    role: (schema.user as any).role,
  }).from(schema.user).where(eq(schema.user.id, userId)).limit(1)

  return updated
})
