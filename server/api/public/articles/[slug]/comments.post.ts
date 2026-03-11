import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const currentUser = session.user as { id: string; role: string }
  const slug = getRouterParam(event, 'slug')!
  const { content, parentId } = await readBody(event)

  if (!content?.trim()) {
    throw createError({ statusCode: 400, message: 'Comment content is required' })
  }

  if (content.trim().length > 2000) {
    throw createError({ statusCode: 400, message: 'Comment must be under 2000 characters' })
  }

  const [article] = await db.select({ id: schema.articles.id, status: schema.articles.status })
    .from(schema.articles)
    .where(eq(schema.articles.slug, slug))
    .limit(1)

  if (!article || article.status !== 'published') {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }

  // If replying, validate parent exists and belongs to same article
  if (parentId) {
    const [parent] = await db.select({ id: schema.comments.id, articleId: schema.comments.articleId })
      .from(schema.comments)
      .where(eq(schema.comments.id, parentId))
      .limit(1)

    if (!parent || parent.articleId !== article.id) {
      throw createError({ statusCode: 400, message: 'Invalid parent comment' })
    }
  }

  const now = new Date()
  const [comment] = await db.insert(schema.comments).values({
    articleId: article.id,
    authorId: currentUser.id,
    content: content.trim(),
    parentId: parentId || null,
    createdAt: now,
    updatedAt: now,
  }).returning()

  // Return comment with author info
  const withAuthor = await db.query.comments.findFirst({
    where: eq(schema.comments.id, comment.id),
    columns: { id: true, content: true, parentId: true, createdAt: true, authorId: true },
    with: {
      author: { columns: { name: true, image: true } },
    },
  })

  const { author, ...rest } = withAuthor!
  return { ...rest, authorName: author?.name ?? null, authorAvatar: author?.image ?? null, replies: [] }
})
