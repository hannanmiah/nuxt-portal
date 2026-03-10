import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
})

export const articles = sqliteTable('articles', {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  slug: text().notNull().unique(),
  excerpt: text(),
  content: text().notNull(),
  coverImage: text(),
  categoryId: integer().references(() => categories.id),
  // References Better Auth's user.id (text-based ID)
  authorId: text().notNull(),
  status: text({ enum: ['draft', 'review', 'published', 'archived'] }).notNull().default('draft'),
  publishedAt: integer({ mode: 'timestamp' }),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).notNull(),
})

export const comments = sqliteTable('comments', {
  id: integer().primaryKey({ autoIncrement: true }),
  articleId: integer().notNull().references(() => articles.id, { onDelete: 'cascade' }),
  // References Better Auth's user.id (text-based ID)
  authorId: text().notNull(),
  content: text().notNull(),
  parentId: integer().references((): any => comments.id, { onDelete: 'cascade' }),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).notNull(),
})
