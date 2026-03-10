import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1)
  if (!user || !await verifyPassword(user.password, password)) {
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
  })

  return { user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } }
})
