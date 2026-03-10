import { db, schema } from '@nuxthub/db'
import { eq, count, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireMinRole(event, 'admin')

  const [publishedRow] = await db.select({ count: count() }).from(schema.articles)
    .where(eq(schema.articles.status, 'published'))
  const [draftRow] = await db.select({ count: count() }).from(schema.articles)
    .where(eq(schema.articles.status, 'draft'))
  const [reviewRow] = await db.select({ count: count() }).from(schema.articles)
    .where(eq(schema.articles.status, 'review'))
  const [totalRow] = await db.select({ count: count() }).from(schema.articles)
  const [usersRow] = await db.select({ count: count() }).from(schema.user)

  return {
    total: totalRow.count,
    published: publishedRow.count,
    drafts: draftRow.count,
    reviews: reviewRow.count,
    totalUsers: usersRow.count,
  }
})
