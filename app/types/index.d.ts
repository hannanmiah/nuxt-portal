import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'
export type UserRole = 'admin' | 'editor' | 'reporter' | 'viewer'
export type ArticleStatus = 'draft' | 'review' | 'published' | 'archived'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  avatar: string
  role: UserRole
}

export interface Article {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  content: string
  coverImage?: string | null
  status: ArticleStatus
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  categoryId?: number | null
  categoryName?: string | null
  categorySlug?: string | null
  authorId: number
  authorName?: string | null
  authorAvatar?: string | null
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
  createdAt: string
}

export interface Comment {
  id: number
  content: string
  parentId?: number | null
  createdAt: string
  updatedAt: string
  articleId: number
  authorId: number
  authorName?: string | null
  authorAvatar?: string | null
  replies?: Comment[]
}

export interface AdminUser {
  id: number
  name: string
  email: string
  avatar: string
  role: UserRole
  createdAt: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}
