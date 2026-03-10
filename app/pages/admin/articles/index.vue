<script setup lang="ts">
import type { Article } from '~/types'

definePageMeta({ middleware: 'auth' })

const { isEditor, isAdmin, user } = useAuth()
const toast = useToast()

const statusFilter = ref('')
const { data, refresh, pending } = await useFetch('/api/admin/articles', {
  query: computed(() => ({ status: statusFilter.value || undefined, limit: 50 })),
  default: () => ({ articles: [] as Article[] })
})

const articles = computed(() => data.value.articles)

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'In Review', value: 'review' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

const statusColors: Record<string, any> = {
  draft: 'neutral',
  review: 'warning',
  published: 'success',
  archived: 'error'
}

const deleteConfirm = ref<Article | null>(null)

async function deleteArticle(article: Article) {
  try {
    await $fetch(`/api/admin/articles/${article.id}`, { method: 'DELETE' })
    toast.add({ title: 'Article deleted', color: 'success' })
    refresh()
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed to delete', color: 'error' })
  }
  deleteConfirm.value = null
}

async function togglePublish(article: Article) {
  try {
    await $fetch(`/api/admin/articles/${article.id}`, { method: 'PATCH' })
    toast.add({
      title: article.status === 'published' ? 'Article archived' : 'Article published',
      color: 'success'
    })
    refresh()
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed', color: 'error' })
  }
}

function formatDate(d: string | null | undefined) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <UDashboardPanel id="articles">
    <template #header>
      <UDashboardNavbar title="Articles" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-plus" to="/admin/articles/new">New Article</UButton>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted">Filter:</span>
            <div class="flex gap-1">
              <UButton
                v-for="opt in statusOptions"
                :key="opt.value"
                size="xs"
                :variant="statusFilter === opt.value ? 'solid' : 'ghost'"
                @click="statusFilter = opt.value"
              >{{ opt.label }}</UButton>
            </div>
          </div>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="p-4">
        <div v-if="pending" class="flex justify-center py-12">
          <UIcon name="i-lucide-loader" class="size-8 animate-spin text-muted" />
        </div>

        <div v-else-if="!articles.length" class="text-center py-16 text-muted">
          <UIcon name="i-lucide-file-text" class="size-16 mx-auto mb-4 opacity-30" />
          <p class="text-lg font-medium">No articles found</p>
          <UButton class="mt-4" to="/admin/articles/new" icon="i-lucide-plus">Create your first article</UButton>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="article in articles"
            :key="article.id"
            class="flex items-start gap-4 p-4 rounded-lg border border-default hover:bg-elevated/30 transition-colors"
          >
            <img
              v-if="article.coverImage"
              :src="article.coverImage?.startsWith('http') ? article.coverImage : `/files/${article.coverImage}`"
              class="w-20 h-14 object-cover rounded-md flex-shrink-0 hidden sm:block"
              :alt="article.title"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-2 flex-wrap">
                <h3 class="font-semibold text-sm leading-tight flex-1 min-w-0">{{ article.title }}</h3>
                <UBadge :label="article.status" :color="statusColors[article.status]" variant="soft" size="xs" />
              </div>
              <p class="text-xs text-muted mt-1 line-clamp-1">{{ article.excerpt || 'No excerpt' }}</p>
              <div class="flex items-center gap-3 mt-2 text-xs text-muted flex-wrap">
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-user" class="size-3" />
                  {{ article.authorName }}
                </span>
                <span v-if="article.categoryName" class="flex items-center gap-1">
                  <UIcon name="i-lucide-tag" class="size-3" />
                  {{ article.categoryName }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-calendar" class="size-3" />
                  {{ formatDate(article.updatedAt) }}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              <UButton
                :to="`/admin/articles/${article.id}/edit`"
                icon="i-lucide-edit"
                size="xs"
                variant="ghost"
                square
              />
              <UButton
                v-if="isEditor"
                :icon="article.status === 'published' ? 'i-lucide-archive' : 'i-lucide-send'"
                size="xs"
                variant="ghost"
                square
                :color="article.status === 'published' ? 'warning' : 'success'"
                @click="togglePublish(article)"
              />
              <UButton
                v-if="isEditor"
                icon="i-lucide-trash-2"
                size="xs"
                variant="ghost"
                color="error"
                square
                @click="deleteConfirm = article"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Delete confirmation modal -->
  <UModal v-if="deleteConfirm" :open="!!deleteConfirm" title="Delete Article" @update:open="deleteConfirm = null">
    <template #body>
      <p>Are you sure you want to delete <strong>{{ deleteConfirm?.title }}</strong>? This action cannot be undone.</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="deleteConfirm = null">Cancel</UButton>
        <UButton color="error" @click="deleteArticle(deleteConfirm!)">Delete</UButton>
      </div>
    </template>
  </UModal>
</template>
