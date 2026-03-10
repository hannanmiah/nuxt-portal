import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireMinRole(event, 'admin')
  const id = getRouterParam(event, 'id') as string
  const { role, name, avatar } = await readBody(event)
  const validRoles = ['admin', 'editor', 'reporter', 'viewer']
  if (role && !validRoles.includes(role)) {
    throw createError({ statusCode: 400, message: 'Invalid role' })
  }

  const updateData: Record<string, unknown> = {}
  if (role) updateData.role = role
  if (name) updateData.name = name
  if (avatar !== undefined) updateData.avatar = avatar

  const [updated] = await db.update(schema.user).set(updateData).where(eq(schema.user.id, id)).returning({
    id: schema.user.id,
    name: schema.user.name,
    email: schema.user.email,
    avatar: (schema.user as any).avatar,
    role: (schema.user as any).role,
  })

  if (!updated) throw createError({ statusCode: 404, message: 'User not found' })
  return updated
})
