import { db, schema } from '@nuxthub/db'
import { eq, desc, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const categorySlug = query.category as string | undefined
  const limit = Math.min(Number(query.limit) || 12, 50)
  const offset = Number(query.offset) || 0

  let categoryId: number | undefined
  if (categorySlug) {
    const cat = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, categorySlug),
      columns: { id: true },
    })
    if (!cat) return { articles: [], total: 0 }
    categoryId = cat.id
  }

  const conditions = categoryId
    ? and(eq(schema.articles.status, 'published'), eq(schema.articles.categoryId, categoryId))
    : eq(schema.articles.status, 'published')

  const rows = await db.query.articles.findMany({
    where: conditions,
    columns: {
      id: true, title: true, slug: true, excerpt: true, coverImage: true,
      publishedAt: true, categoryId: true, authorId: true,
    },
    with: {
      category: { columns: { name: true, slug: true } },
      author: { columns: { name: true, image: true } },
    },
    orderBy: [desc(schema.articles.publishedAt)],
    limit,
    offset,
  })

  const articles = rows.map(({ category, author, ...row }) => ({
    ...row,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    authorName: author?.name ?? null,
    authorAvatar: author?.image ?? null,
  }))

  return { articles }
})
