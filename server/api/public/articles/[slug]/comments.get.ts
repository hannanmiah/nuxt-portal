import { db, schema } from '@nuxthub/db'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  const article = await db.query.articles.findFirst({
    where: eq(schema.articles.slug, slug),
    columns: { id: true },
  })

  if (!article) {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }

  const rows = await db.query.comments.findMany({
    where: eq(schema.comments.articleId, article.id),
    columns: {
      id: true, content: true, parentId: true,
      createdAt: true, updatedAt: true, authorId: true,
    },
    with: {
      author: { columns: { name: true, image: true } },
    },
    orderBy: [asc(schema.comments.createdAt)],
  })

  const commentMap = new Map<number, any>()
  const roots: any[] = []

  for (const { author, ...c } of rows) {
    commentMap.set(c.id, {
      ...c,
      authorName: author?.name ?? null,
      authorAvatar: author?.image ?? null,
      replies: [],
    })
  }
  for (const c of rows) {
    if (c.parentId && commentMap.has(c.parentId)) {
      commentMap.get(c.parentId).replies.push(commentMap.get(c.id))
    } else if (!c.parentId) {
      roots.push(commentMap.get(c.id))
    }
  }

  return { comments: roots, total: rows.length }
})
