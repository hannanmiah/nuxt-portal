import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireMinRole(event, 'admin')
  const { name, email, password, role } = await readBody(event)

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, message: 'Name, email and password are required' })
  }

  const validRoles = ['admin', 'editor', 'reporter', 'viewer']
  if (role && !validRoles.includes(role)) {
    throw createError({ statusCode: 400, message: 'Invalid role' })
  }

  const [existing] = await db.select({ id: schema.user.id }).from(schema.user)
    .where(eq(schema.user.email, email.toLowerCase())).limit(1)
  if (existing) {
    throw createError({ statusCode: 409, message: 'A user with this email already exists' })
  }

  const auth = serverAuth()
  await auth.api.signUpEmail({
    body: { name, email, password },
  })

  const [newUser] = await db.select({
    id: schema.user.id,
    name: schema.user.name,
    email: schema.user.email,
    avatar: schema.user.image,
    role: (schema.user as any).role,
    createdAt: schema.user.createdAt,
  }).from(schema.user).where(eq(schema.user.email, email.toLowerCase())).limit(1)

  if (!newUser) {
    throw createError({ statusCode: 500, message: 'Failed to create user' })
  }

  if (role && role !== 'viewer') {
    await db.update(schema.user).set({ role } as any).where(eq(schema.user.id, newUser.id))
    newUser.role = role
  }

  return newUser
})
