import { db, schema } from '@nuxthub/db'
import { eq, desc, and } from 'drizzle-orm'

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

  const rows = await db.query.articles.findMany({
    where: conditions,
    columns: {
      id: true, title: true, slug: true, excerpt: true, coverImage: true,
      status: true, publishedAt: true, createdAt: true, updatedAt: true,
      categoryId: true, authorId: true,
    },
    with: {
      category: { columns: { name: true } },
      author: { columns: { name: true } },
    },
    orderBy: [desc(schema.articles.updatedAt)],
    limit,
    offset,
  })

  const articles = rows.map(({ category, author, ...row }) => ({
    ...row,
    categoryName: category?.name ?? null,
    authorName: author?.name ?? null,
  }))

  return { articles }
})
