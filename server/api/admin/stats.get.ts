import { db, schema } from '@nuxthub/db'
import { eq, count, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const isEditorAbove = hasRole(user.role, 'editor')

  const totalArticles = isEditorAbove
    ? await db.select({ count: count() }).from(schema.articles)
    : await db.select({ count: count() }).from(schema.articles).where(eq(schema.articles.authorId, user.id))

  const [publishedRow] = await db.select({ count: count() }).from(schema.articles)
    .where(eq(schema.articles.status, 'published'))
  const [draftRow] = await db.select({ count: count() }).from(schema.articles)
    .where(eq(schema.articles.status, 'draft'))
  const [reviewRow] = await db.select({ count: count() }).from(schema.articles)
    .where(eq(schema.articles.status, 'review'))

  let totalUsers = 0
  if (hasRole(user.role, 'admin')) {
    const [usersRow] = await db.select({ count: count() }).from(schema.users)
    totalUsers = usersRow.count
  }

  return {
    total: totalArticles[0].count,
    published: publishedRow.count,
    drafts: draftRow.count,
    reviews: reviewRow.count,
    totalUsers,
  }
})
