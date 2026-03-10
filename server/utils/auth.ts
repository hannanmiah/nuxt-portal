import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { slugify } from 'transliteration'

export type UserRole = 'admin' | 'editor' | 'reporter' | 'viewer'

const ROLE_LEVELS: Record<UserRole, number> = {
  admin: 4,
  editor: 3,
  reporter: 2,
  viewer: 1,
}

export function generateSlug(title: string): string {
  const slug = slugify(title, {
    lowercase: true,
    separator: '-',
    trim: true,
  })
  // Fallback to timestamp if title has no usable characters (e.g. only symbols)
  return slug || `post-${Date.now()}`
}

export function hasRole(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[minRole]
}

export async function requireAuth(event: any) {
  const session = await requireUserSession(event)
  return session.user as { id: number; name: string; email: string; role: UserRole; avatar: string }
}

export async function requireMinRole(event: any, minRole: UserRole) {
  const user = await requireAuth(event)
  if (!hasRole(user.role, minRole)) {
    throw createError({ statusCode: 403, message: 'Insufficient permissions' })
  }
  return user
}

export async function canEditArticle(event: any, articleId: number) {
  const user = await requireAuth(event)
  if (hasRole(user.role, 'editor')) return user
  const [article] = await db.select().from(schema.articles).where(eq(schema.articles.id, articleId)).limit(1)
  if (!article) throw createError({ statusCode: 404, message: 'Article not found' })
  if (article.authorId !== user.id) {
    throw createError({ statusCode: 403, message: 'You can only edit your own articles' })
  }
  return user
}
