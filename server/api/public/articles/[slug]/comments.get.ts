import { db, schema } from '@nuxthub/db'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  const [article] = await db.select({ id: schema.articles.id })
    .from(schema.articles)
    .where(eq(schema.articles.slug, slug))
    .limit(1)

  if (!article) {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }

  const rows = await db
    .select({
      id: schema.comments.id,
      content: schema.comments.content,
      parentId: schema.comments.parentId,
      createdAt: schema.comments.createdAt,
      updatedAt: schema.comments.updatedAt,
      authorId: schema.comments.authorId,
      authorName: schema.users.name,
      authorAvatar: schema.users.avatar,
    })
    .from(schema.comments)
    .leftJoin(schema.users, eq(schema.comments.authorId, schema.users.id))
    .where(eq(schema.comments.articleId, article.id))
    .orderBy(asc(schema.comments.createdAt))

  // Build threaded structure
  const commentMap = new Map<number, any>()
  const roots: any[] = []

  for (const c of rows) {
    commentMap.set(c.id, { ...c, replies: [] })
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
