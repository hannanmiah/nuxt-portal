import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireMinRole(event, 'admin')
  const id = Number(getRouterParam(event, 'id'))
  const [cat] = await db.select().from(schema.categories).where(eq(schema.categories.id, id)).limit(1)
  if (!cat) throw createError({ statusCode: 404, message: 'Category not found' })

  await db.delete(schema.categories).where(eq(schema.categories.id, id))
  return { message: 'Category deleted' }
})
