import { db, schema } from '@nuxthub/db'
import { eq, desc, and, or } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireMinRole(event, 'admin')
  const query = getQuery(event)
  const status = query.status as string | undefined
  const categoryId = query.categoryId ? Number(query.categoryId) : undefined
  const limit = Math.min(Number(query.limit) || 20, 100)
  const offset = Number(query.offset) || 0

  let conditions: any = undefined
  if (status) conditions = eq(schema.articles.status, status as any)
  if (categoryId) {
    conditions = conditions
      ? and(conditions, eq(schema.articles.categoryId, categoryId))
      : eq(schema.articles.categoryId, categoryId)
  }

  const rows = await db
    .select({
      id: schema.articles.id,
      title: schema.articles.title,
      slug: schema.articles.slug,
      excerpt: schema.articles.excerpt,
      coverImage: schema.articles.coverImage,
      status: schema.articles.status,
      publishedAt: schema.articles.publishedAt,
      createdAt: schema.articles.createdAt,
      updatedAt: schema.articles.updatedAt,
      categoryId: schema.articles.categoryId,
      categoryName: schema.categories.name,
      authorId: schema.articles.authorId,
      authorName: schema.user.name,
    })
    .from(schema.articles)
    .leftJoin(schema.categories, eq(schema.articles.categoryId, schema.categories.id))
    .leftJoin(schema.user, eq(schema.articles.authorId, schema.user.id))
    .where(conditions)
    .orderBy(desc(schema.articles.updatedAt))
    .limit(limit)
    .offset(offset)

  return { articles: rows }
})
