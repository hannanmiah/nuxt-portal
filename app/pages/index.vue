<script setup lang="ts">
import type { Article } from '~/types'

definePageMeta({ layout: 'public' })

useSeoMeta({ title: 'Latest News' })

const { data: articlesData } = await useFetch('/api/public/articles', {
  query: { limit: 12 },
  default: () => ({ articles: [] as Article[] })
})

const articles = computed(() => articlesData.value.articles)
const featuredArticle = computed(() => articles.value[0] || null)
const latestArticles = computed(() => articles.value.slice(1, 7))
const moreArticles = computed(() => articles.value.slice(7))

function formatDate(d: string | null | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div>
    <section v-if="featuredArticle" class="border-b border-default">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <NuxtLink :to="`/article/${featuredArticle.slug}`" class="group block">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div v-if="featuredArticle.coverImage" class="order-last lg:order-first">
              <img :src="resolveImageUrl(featuredArticle.coverImage)" :alt="featuredArticle.title" class="w-full aspect-video object-cover rounded-xl" />
            </div>
            <div>
              <div class="flex items-center gap-2 mb-3">
                <UBadge v-if="featuredArticle.categoryName" :label="featuredArticle.categoryName" color="primary" variant="soft" />
                <span class="text-sm text-muted">Featured</span>
              </div>
              <h1 class="text-3xl sm:text-4xl font-bold leading-tight group-hover:text-primary transition-colors">{{ featuredArticle.title }}</h1>
              <p v-if="featuredArticle.excerpt" class="text-muted mt-3 text-lg leading-relaxed line-clamp-3">{{ featuredArticle.excerpt }}</p>
              <div class="flex items-center gap-3 mt-4 text-sm text-muted">
                <span>By {{ featuredArticle.authorName }}</span>
                <span>·</span>
                <span>{{ formatDate(featuredArticle.publishedAt) }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <div v-if="!articles.length" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-muted">
      <UIcon name="i-lucide-newspaper" class="size-20 mx-auto mb-4 opacity-20" />
      <h2 class="text-2xl font-bold mb-2">No articles published yet</h2>
      <p class="mb-6">Check back soon for the latest news.</p>
      <UButton to="/admin" variant="outline">Go to Admin Panel</UButton>
    </div>

    <section v-if="latestArticles.length" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 class="text-2xl font-bold mb-6">Latest News</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink v-for="article in latestArticles" :key="article.id" :to="`/article/${article.slug}`" class="group flex flex-col gap-3">
          <div class="overflow-hidden rounded-lg bg-elevated aspect-video">
            <img v-if="article.coverImage" :src="resolveImageUrl(article.coverImage)" :alt="article.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-lucide-image" class="size-10 text-muted opacity-30" />
            </div>
          </div>
          <div>
            <UBadge v-if="article.categoryName" :label="article.categoryName" color="primary" variant="soft" size="xs" class="mb-2" />
            <h3 class="font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">{{ article.title }}</h3>
            <p v-if="article.excerpt" class="text-muted text-sm mt-1 line-clamp-2">{{ article.excerpt }}</p>
            <div class="flex items-center gap-2 mt-2 text-xs text-muted">
              <span>{{ article.authorName }}</span>
              <span>·</span>
              <span>{{ formatDate(article.publishedAt) }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section v-if="moreArticles.length" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <h2 class="text-xl font-bold mb-4">More Stories</h2>
      <div class="flex flex-col gap-1">
        <NuxtLink v-for="article in moreArticles" :key="article.id" :to="`/article/${article.slug}`" class="flex items-center gap-4 py-3 border-b border-default last:border-0 group">
          <div v-if="article.categoryName" class="hidden sm:block">
            <UBadge :label="article.categoryName" color="primary" variant="soft" size="xs" />
          </div>
          <p class="flex-1 font-medium group-hover:text-primary transition-colors line-clamp-1">{{ article.title }}</p>
          <span class="text-xs text-muted flex-shrink-0">{{ formatDate(article.publishedAt) }}</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
