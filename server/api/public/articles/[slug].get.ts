import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  const article = await db.query.articles.findFirst({
    where: eq(schema.articles.slug, slug),
    with: {
      category: { columns: { name: true, slug: true } },
      author: { columns: { name: true, image: true } },
    },
  })

  if (!article) {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }

  if (article.status !== 'published') {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }

  const { category, author, ...rest } = article
  return {
    ...rest,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    authorName: author?.name ?? null,
    authorAvatar: author?.image ?? null,
  }
})
