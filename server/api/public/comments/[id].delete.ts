import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const currentUser = session.user as { id: number; role: string }
  const id = Number(getRouterParam(event, 'id'))

  const [comment] = await db.select()
    .from(schema.comments)
    .where(eq(schema.comments.id, id))
    .limit(1)

  if (!comment) {
    throw createError({ statusCode: 404, message: 'Comment not found' })
  }

  const isAdminOrEditor = ['admin', 'editor'].includes(currentUser.role)
  if (comment.authorId !== currentUser.id && !isAdminOrEditor) {
    throw createError({ statusCode: 403, message: 'You can only delete your own comments' })
  }

  await db.delete(schema.comments).where(eq(schema.comments.id, id))
  return { message: 'Comment deleted' }
})
