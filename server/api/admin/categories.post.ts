import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireMinRole(event, 'admin')
  const { name, description } = await readBody(event)
  if (!name) throw createError({ statusCode: 400, message: 'Category name is required' })

  const slug = generateSlug(name)
  const [existing] = await db.select().from(schema.categories).where(eq(schema.categories.slug, slug)).limit(1)
  if (existing) throw createError({ statusCode: 409, message: 'Category with this name already exists' })

  const [category] = await db.insert(schema.categories).values({
    name,
    slug,
    description: description || null,
    createdAt: new Date(),
  }).returning()

  return category
})
