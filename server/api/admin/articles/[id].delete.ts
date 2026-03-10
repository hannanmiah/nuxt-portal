import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  await requireMinRole(event, 'admin')

  const [article] = await db.select().from(schema.articles).where(eq(schema.articles.id, id)).limit(1)
  if (!article) throw createError({ statusCode: 404, message: 'Article not found' })

  await db.delete(schema.articles).where(eq(schema.articles.id, id))
  return { message: 'Article deleted successfully' }
})

