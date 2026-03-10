<script setup lang="ts">
import type { Article } from '~/types'

definePageMeta({ layout: 'public' })

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: categories } = await useFetch('/api/public/categories')
const category = computed(() => categories.value?.find((c: any) => c.slug === slug.value))

const { data: articlesData } = await useFetch('/api/public/articles', {
  query: computed(() => ({ category: slug.value, limit: 20 })),
  default: () => ({ articles: [] as Article[] })
})

const articles = computed(() => articlesData.value.articles)

function formatDate(d: string | null | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

useSeoMeta({
  title: () => category.value ? `${category.value.name} - NewsPortal` : 'Category',
  description: () => category.value?.description || '',
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Category header -->
    <div class="mb-8 pb-6 border-b border-default">
      <nav class="flex items-center gap-2 text-sm text-muted mb-4">
        <NuxtLink to="/" class="hover:text-foreground transition-colors">Home</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
        <span class="text-foreground capitalize">{{ category?.name || slug }}</span>
      </nav>
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-tag" class="size-6 text-primary" />
        <div>
          <h1 class="text-3xl font-bold capitalize">{{ category?.name || slug }}</h1>
          <p v-if="category?.description" class="text-muted mt-1">{{ category.description }}</p>
        </div>
      </div>
      <p class="text-sm text-muted mt-2">{{ articles.length }} articles</p>
    </div>

    <!-- Empty state -->
    <div v-if="!articles.length" class="text-center py-16 text-muted">
      <UIcon name="i-lucide-file-search" class="size-16 mx-auto mb-4 opacity-30" />
      <p class="text-lg font-medium">No articles in this category yet.</p>
      <NuxtLink to="/" class="mt-4 inline-block text-primary hover:underline">← Back to home</NuxtLink>
    </div>

    <!-- Articles grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="article in articles"
        :key="article.id"
        :to="`/article/${article.slug}`"
        class="group flex flex-col gap-3"
      >
        <div class="overflow-hidden rounded-lg bg-elevated aspect-video">
          <img
            v-if="article.coverImage"
            :src="resolveImageUrl(article.coverImage)"
            :alt="article.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-lucide-image" class="size-10 text-muted opacity-30" />
          </div>
        </div>
        <div>
          <h3 class="font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {{ article.title }}
          </h3>
          <p v-if="article.excerpt" class="text-muted text-sm mt-1 line-clamp-2">{{ article.excerpt }}</p>
          <div class="flex items-center gap-2 mt-2 text-xs text-muted">
            <span>{{ article.authorName }}</span>
            <span>·</span>
            <span>{{ formatDate(article.publishedAt) }}</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
