import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const user = await canEditArticle(event, id)
  const body = await readBody(event)
  const { title, excerpt, content, coverImage, categoryId, status } = body

  if (!title || !content) {
    throw createError({ statusCode: 400, message: 'Title and content are required' })
  }

  let newStatus = status || 'draft'
  if (!hasRole(user.role, 'editor') && !['draft', 'review'].includes(newStatus)) {
    newStatus = 'review'
  }

  const [existing] = await db.select().from(schema.articles).where(eq(schema.articles.id, id)).limit(1)
  const now = new Date()
  const publishedAt = newStatus === 'published' && existing.status !== 'published' ? now : existing.publishedAt

  const [updated] = await db.update(schema.articles).set({
    title,
    excerpt: excerpt || null,
    content,
    coverImage: coverImage || null,
    categoryId: categoryId || null,
    status: newStatus,
    publishedAt,
    updatedAt: now,
  }).where(eq(schema.articles.id, id)).returning()

  return updated
})
