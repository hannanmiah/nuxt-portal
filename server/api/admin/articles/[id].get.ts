import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  await requireMinRole(event, 'admin')

  const article = await db.query.articles.findFirst({
    where: eq(schema.articles.id, id),
    with: {
      category: { columns: { name: true } },
      author: { columns: { name: true } },
    },
  })

  if (!article) throw createError({ statusCode: 404, message: 'Article not found' })

  const { category, author, ...rest } = article
  return {
    ...rest,
    categoryName: category?.name ?? null,
    authorName: author?.name ?? null,
  }
})
