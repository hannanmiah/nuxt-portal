<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isNotificationsSlideoverOpen } = useDashboard()
const { user, isAdmin, isEditor } = useAuth()

const { data: stats } = await useFetch('/api/admin/stats', {
  default: () => ({ total: 0, published: 0, drafts: 0, reviews: 0, totalUsers: 0 })
})

const statCards = computed(() => [
  { title: 'Total Articles', value: stats.value.total, icon: 'i-lucide-file-text', color: 'text-primary' },
  { title: 'Published', value: stats.value.published, icon: 'i-lucide-check-circle', color: 'text-green-500' },
  { title: 'Drafts', value: stats.value.drafts, icon: 'i-lucide-file-edit', color: 'text-yellow-500' },
  { title: 'In Review', value: stats.value.reviews, icon: 'i-lucide-clock', color: 'text-blue-500' },
  ...(isAdmin.value ? [{ title: 'Total Users', value: stats.value.totalUsers, icon: 'i-lucide-users', color: 'text-purple-500' }] : [])
])

const { data: recentArticles } = await useFetch('/api/admin/articles', {
  query: { limit: 5 },
  default: () => ({ articles: [] })
})

const statusColors: Record<string, any> = {
  draft: 'neutral',
  review: 'warning',
  published: 'success',
  archived: 'error'
}
</script>

<template>
  <UDashboardPanel id="admin-home">
    <template #header>
      <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>
          <UButton icon="i-lucide-plus" size="md" class="rounded-full" to="/admin/articles/new" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6 p-4 sm:p-6">
        <!-- Welcome -->
        <div>
          <h2 class="text-2xl font-bold">Welcome back, {{ user?.name }}!</h2>
          <p class="text-muted mt-1 capitalize">Role: <UBadge :label="user?.role" variant="soft" /></p>
        </div>

        <!-- Stats grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <UCard v-for="stat in statCards" :key="stat.title" class="text-center">
            <div class="flex flex-col items-center gap-2">
              <UIcon :name="stat.icon" class="size-8" :class="stat.color" />
              <div class="text-3xl font-bold">{{ stat.value }}</div>
              <div class="text-sm text-muted">{{ stat.title }}</div>
            </div>
          </UCard>
        </div>

        <!-- Recent articles -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Recent Articles</h3>
            <UButton variant="ghost" size="sm" to="/admin/articles">View all</UButton>
          </div>
          <div class="flex flex-col gap-2">
            <NuxtLink
              v-for="article in recentArticles.articles"
              :key="article.id"
              :to="`/admin/articles/${article.id}/edit`"
              class="flex items-center gap-3 p-3 rounded-lg border border-default hover:bg-elevated/50 transition-colors"
            >
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ article.title }}</p>
                <p class="text-sm text-muted">By {{ article.authorName }} · {{ article.categoryName || 'Uncategorized' }}</p>
              </div>
              <UBadge :label="article.status" :color="statusColors[article.status]" variant="soft" />
            </NuxtLink>
            <div v-if="!recentArticles.articles.length" class="text-center text-muted py-8">
              <UIcon name="i-lucide-file-text" class="size-12 mx-auto mb-2 opacity-30" />
              <p>No articles yet. <NuxtLink to="/admin/articles/new" class="text-primary">Create your first article</NuxtLink></p>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
          <div class="flex flex-wrap gap-3">
            <UButton icon="i-lucide-plus" to="/admin/articles/new">New Article</UButton>
            <UButton icon="i-lucide-tag" to="/admin/categories" variant="outline" v-if="isEditor">Manage Categories</UButton>
            <UButton icon="i-lucide-users" to="/admin/users" variant="outline" v-if="isAdmin">Manage Users</UButton>
            <UButton icon="i-lucide-external-link" to="/" target="_blank" variant="ghost">View Portal</UButton>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
