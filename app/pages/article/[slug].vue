<script setup lang="ts">
import type { Article } from '~/types'

definePageMeta({ layout: 'public' })

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: article, error } = await useFetch(`/api/public/articles/${slug.value}`)

if (error.value) {
  throw createError({ statusCode: 404, message: 'Article not found' })
}

const { data: relatedData } = await useFetch('/api/public/articles', {
  query: computed(() => ({ category: article.value?.categorySlug, limit: 4 })),
  default: () => ({ articles: [] as Article[] })
})

const relatedArticles = computed(() =>
  relatedData.value.articles.filter((a: Article) => a.id !== article.value?.id).slice(0, 3)
)

function formatDate(d: string | null | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

// Format article content (preserve line breaks)
const formattedContent = computed(() => {
  if (!article.value?.content) return ''
  return article.value.content
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br />')
})

useSeoMeta({
  title: () => article.value?.title || 'Article',
  description: () => article.value?.excerpt || '',
  ogImage: () => resolveImageUrl(article.value?.coverImage),
})
</script>

<template>
  <article v-if="article" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-muted mb-6">
      <NuxtLink to="/" class="hover:text-foreground transition-colors">Home</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="size-4" />
      <NuxtLink
        v-if="article.categorySlug"
        :to="`/category/${article.categorySlug}`"
        class="hover:text-foreground transition-colors"
      >{{ article.categoryName }}</NuxtLink>
      <span v-else>Uncategorized</span>
      <UIcon name="i-lucide-chevron-right" class="size-4" />
      <span class="text-foreground line-clamp-1">{{ article.title }}</span>
    </nav>

    <!-- Category & meta -->
    <div class="flex items-center gap-2 mb-4">
      <UBadge v-if="article.categoryName" :label="article.categoryName" color="primary" variant="soft" />
    </div>

    <!-- Title -->
    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">{{ article.title }}</h1>

    <!-- Excerpt -->
    <p v-if="article.excerpt" class="text-xl text-muted leading-relaxed mb-6 border-l-4 border-primary pl-4">
      {{ article.excerpt }}
    </p>

    <!-- Author & Date -->
    <div class="flex items-center gap-4 mb-8 pb-6 border-b border-default">
      <UAvatar :src="resolveImageUrl(article.authorAvatar)" :alt="article.authorName || ''" size="md" />
      <div>
        <p class="font-semibold">{{ article.authorName }}</p>
        <p class="text-sm text-muted">{{ formatDate(article.publishedAt) }}</p>
      </div>
    </div>

    <!-- Cover image -->
    <img
      v-if="article.coverImage"
      :src="resolveImageUrl(article.coverImage)"
      :alt="article.title"
      class="w-full aspect-video object-cover rounded-xl mb-8"
    />

    <!-- Content -->
    <div class="prose prose-lg max-w-none text-foreground leading-relaxed">
      <p
        class="mb-4"
        v-html="`<p class='mb-4'>${formattedContent}</p>`"
      />
    </div>

    <!-- Tags/Category footer -->
    <div class="mt-10 pt-6 border-t border-default flex items-center gap-2">
      <span class="text-sm text-muted">Filed under:</span>
      <NuxtLink
        v-if="article.categorySlug"
        :to="`/category/${article.categorySlug}`"
      >
        <UBadge :label="article.categoryName || 'Uncategorized'" color="primary" variant="soft" />
      </NuxtLink>
    </div>

    <!-- Related articles -->
    <section v-if="relatedArticles.length" class="mt-12">
      <h2 class="text-2xl font-bold mb-6">Related Articles</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <NuxtLink
          v-for="related in relatedArticles"
          :key="related.id"
          :to="`/article/${related.slug}`"
          class="group flex flex-col gap-2"
        >
          <div class="overflow-hidden rounded-lg bg-elevated aspect-video">
            <img
              v-if="related.coverImage"
              :src="resolveImageUrl(related.coverImage)"
              :alt="related.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-lucide-image" class="size-8 text-muted opacity-30" />
            </div>
          </div>
          <h3 class="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {{ related.title }}
          </h3>
        </NuxtLink>
      </div>
    </section>

    <!-- Comments -->
    <CommentSection :slug="slug" />
  </article>
</template>
