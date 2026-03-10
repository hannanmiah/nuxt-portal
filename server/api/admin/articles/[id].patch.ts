import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  await requireMinRole(event, 'editor')

  const [article] = await db.select().from(schema.articles).where(eq(schema.articles.id, id)).limit(1)
  if (!article) throw createError({ statusCode: 404, message: 'Article not found' })

  const now = new Date()
  const newStatus = article.status === 'published' ? 'archived' : 'published'
  const [updated] = await db.update(schema.articles).set({
    status: newStatus,
    publishedAt: newStatus === 'published' ? now : article.publishedAt,
    updatedAt: now,
  }).where(eq(schema.articles.id, id)).returning()

  return updated
})
