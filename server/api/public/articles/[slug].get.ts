import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

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
    .where(eq(schema.articles.slug, slug))
    .limit(1)

  if (!article) {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }

  if (article.status !== 'published') {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }

  return article
})
