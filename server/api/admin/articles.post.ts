import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireMinRole(event, 'admin')
  const body = await readBody(event)
  const { title, excerpt, content, coverImage, categoryId } = body

  if (!title || !content) {
    throw createError({ statusCode: 400, message: 'Title and content are required' })
  }

  const status = body.status || 'draft'

  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let attempt = 0
  while (true) {
    const existing = await db.select({ id: schema.articles.id })
      .from(schema.articles)
      .where(eq(schema.articles.slug, slug))
      .limit(1)
    if (!existing.length) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const now = new Date()
  const [article] = await db.insert(schema.articles).values({
    title,
    slug,
    excerpt: excerpt || null,
    content,
    coverImage: coverImage || null,
    categoryId: categoryId || null,
    authorId: user.id,
    status,
    publishedAt: status === 'published' ? now : null,
    createdAt: now,
    updatedAt: now,
  }).returning()

  return article
})
