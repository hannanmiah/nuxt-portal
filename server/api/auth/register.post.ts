import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readBody(event)
  if (!name || !email || !password) {
    throw createError({ statusCode: 400, message: 'Name, email and password are required' })
  }

  const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1)
  if (existing) {
    throw createError({ statusCode: 409, message: 'Email already in use' })
  }

  const [user] = await db.insert(schema.users).values({
    name,
    email,
    password: await hashPassword(password),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    role: 'viewer',
    createdAt: new Date(),
  }).returning()

  return { message: 'Account created successfully', userId: user.id }
})
