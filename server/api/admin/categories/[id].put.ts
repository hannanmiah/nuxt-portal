import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireMinRole(event, 'admin')
  const id = Number(getRouterParam(event, 'id'))
  const { name, description } = await readBody(event)
  if (!name) throw createError({ statusCode: 400, message: 'Category name is required' })

  const [updated] = await db.update(schema.categories).set({
    name,
    slug: generateSlug(name),
    description: description || null,
  }).where(eq(schema.categories.id, id)).returning()

  if (!updated) throw createError({ statusCode: 404, message: 'Category not found' })
  return updated
})
