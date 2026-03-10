import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  avatar: text().notNull(),
  role: text({ enum: ['admin', 'editor', 'reporter', 'viewer'] }).notNull().default('viewer'),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
})

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
  authorId: integer().notNull().references(() => users.id),
  status: text({ enum: ['draft', 'review', 'published', 'archived'] }).notNull().default('draft'),
  publishedAt: integer({ mode: 'timestamp' }),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).notNull(),
})

export const comments = sqliteTable('comments', {
  id: integer().primaryKey({ autoIncrement: true }),
  articleId: integer().notNull().references(() => articles.id, { onDelete: 'cascade' }),
  authorId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text().notNull(),
  parentId: integer().references((): any => comments.id, { onDelete: 'cascade' }),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).notNull(),
})
