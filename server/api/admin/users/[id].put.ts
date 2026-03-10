import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireMinRole(event, 'admin')
  const id = Number(getRouterParam(event, 'id'))
  const { role, name, avatar } = await readBody(event)
  const validRoles = ['admin', 'editor', 'reporter', 'viewer']
  if (role && !validRoles.includes(role)) {
    throw createError({ statusCode: 400, message: 'Invalid role' })
  }

  const updateData: any = {}
  if (role) updateData.role = role
  if (name) updateData.name = name
  if (avatar !== undefined) updateData.avatar = avatar

  const [updated] = await db.update(schema.users).set(updateData).where(eq(schema.users.id, id)).returning({
    id: schema.users.id,
    name: schema.users.name,
    email: schema.users.email,
    avatar: schema.users.avatar,
    role: schema.users.role,
  })

  if (!updated) throw createError({ statusCode: 404, message: 'User not found' })
  return updated
})
