import { db, schema } from '@nuxthub/db'
import { eq, desc, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const categorySlug = query.category as string | undefined
  const limit = Math.min(Number(query.limit) || 12, 50)
  const offset = Number(query.offset) || 0

  let categoryId: number | undefined
  if (categorySlug) {
    const [cat] = await db.select().from(schema.categories).where(eq(schema.categories.slug, categorySlug)).limit(1)
    if (!cat) return { articles: [], total: 0 }
    categoryId = cat.id
  }

  const conditions = categoryId
    ? and(eq(schema.articles.status, 'published'), eq(schema.articles.categoryId, categoryId))
    : eq(schema.articles.status, 'published')

  const rows = await db
    .select({
      id: schema.articles.id,
      title: schema.articles.title,
      slug: schema.articles.slug,
      excerpt: schema.articles.excerpt,
      coverImage: schema.articles.coverImage,
      publishedAt: schema.articles.publishedAt,
      categoryId: schema.articles.categoryId,
      categoryName: schema.categories.name,
      categorySlug: schema.categories.slug,
      authorId: schema.articles.authorId,
      authorName: schema.users.name,
      authorAvatar: schema.users.avatar,
    })
    .from(schema.articles)
    .leftJoin(schema.categories, eq(schema.articles.categoryId, schema.categories.id))
    .leftJoin(schema.users, eq(schema.articles.authorId, schema.users.id))
    .where(conditions)
    .orderBy(desc(schema.articles.publishedAt))
    .limit(limit)
    .offset(offset)

  return { articles: rows }
})
