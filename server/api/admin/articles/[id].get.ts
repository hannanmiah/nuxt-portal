import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  await requireMinRole(event, 'admin')

  const [article] = await db
    .select({
      id: schema.articles.id,
      title: schema.articles.title,
      slug: schema.articles.slug,
      excerpt: schema.articles.excerpt,
      content: schema.articles.content,
      coverImage: schema.articles.coverImage,
      status: schema.articles.status,
      publishedAt: schema.articles.publishedAt,
      createdAt: schema.articles.createdAt,
      updatedAt: schema.articles.updatedAt,
      categoryId: schema.articles.categoryId,
      authorId: schema.articles.authorId,
      categoryName: schema.categories.name,
      authorName: schema.user.name,
    })
    .from(schema.articles)
    .leftJoin(schema.categories, eq(schema.articles.categoryId, schema.categories.id))
    .leftJoin(schema.user, eq(schema.articles.authorId, schema.user.id))
    .where(eq(schema.articles.id, id))
    .limit(1)

  if (!article) throw createError({ statusCode: 404, message: 'Article not found' })
  return article
})
