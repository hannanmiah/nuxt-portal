import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { schema } from '@nuxthub/db'

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
  // References Better Auth's user.id foreign key (text-based ID)
  authorId: text().notNull().references(() => schema.user.id, { onDelete: 'cascade' }),
  status: text({ enum: ['draft', 'review', 'published', 'archived'] }).notNull().default('draft'),
  publishedAt: integer({ mode: 'timestamp' }),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).notNull(),
})

export const comments = sqliteTable('comments', {
  id: integer().primaryKey({ autoIncrement: true }),
  articleId: integer().notNull().references(() => articles.id, { onDelete: 'cascade' }),
  // References Better Auth's user.id (text-based ID)
  authorId: text().notNull().references(() => schema.user.id, { onDelete: 'cascade' }),
  content: text().notNull(),
  parentId: integer().references((): any => comments.id, { onDelete: 'cascade' }),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).notNull(),
})

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}))

export const articlesRelations = relations(articles, ({ one, many }) => ({
  category: one(categories, { fields: [articles.categoryId], references: [categories.id] }),
  author: one(schema.user, { fields: [articles.authorId], references: [schema.user.id] }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  article: one(articles, { fields: [comments.articleId], references: [articles.id] }),
  author: one(schema.user, { fields: [comments.authorId], references: [schema.user.id] }),
  parent: one(comments, { fields: [comments.parentId], references: [comments.id], relationName: 'replies' }),
  replies: many(comments, { relationName: 'replies' }),
}))
