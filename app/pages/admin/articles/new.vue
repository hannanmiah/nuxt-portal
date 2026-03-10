<script setup lang="ts">
import type { Category } from '~/types'

useHead({ title: 'New Article' })

const { isEditor, isReporter, user } = useAuth()
const toast = useToast()
const router = useRouter()

const { data: categories } = await useFetch<Category[]>('/api/admin/categories', { default: () => [] })

const form = reactive({
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  categoryId: null as number | null,
  status: 'draft' as 'draft' | 'review' | 'published' | 'archived',
})

const saving = ref(false)

const statusOptions = computed(() => {
  const base = [
    { label: 'Draft', value: 'draft' },
    { label: 'Submit for Review', value: 'review' },
  ]
  if (isEditor.value) {
    base.push({ label: 'Published', value: 'published' })
    base.push({ label: 'Archived', value: 'archived' })
  }
  return base
})

async function save() {
  if (!form.title || !form.content) {
    toast.add({ title: 'Title and content are required', color: 'error' })
    return
  }
  saving.value = true
  try {
    const article = await $fetch('/api/admin/articles', {
      method: 'POST',
      body: form
    })
    toast.add({ title: 'Article created successfully', color: 'success' })
    router.push('/admin/articles')
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed to create article', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="new-article">
    <template #header>
      <UDashboardNavbar title="New Article">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton variant="ghost" to="/admin/articles">Cancel</UButton>
          <UButton icon="i-lucide-save" :loading="saving" @click="save">Save Article</UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main content -->
          <div class="lg:col-span-2 flex flex-col gap-4">
            <UFormField label="Title" required>
              <UInput v-model="form.title" placeholder="Article title..." size="lg" class="w-full" />
            </UFormField>
            <UFormField label="Excerpt">
              <UTextarea v-model="form.excerpt" placeholder="Brief summary of the article..." :rows="2" class="w-full" />
            </UFormField>
            <UFormField label="Content" required>
              <UTextarea
                v-model="form.content"
                placeholder="Write your article content here... (Markdown supported)"
                :rows="20"
                class="w-full font-mono text-sm"
              />
            </UFormField>
          </div>

          <!-- Sidebar -->
          <div class="flex flex-col gap-4">
            <UCard>
              <template #header>
                <h3 class="font-semibold">Publish Settings</h3>
              </template>
              <div class="flex flex-col gap-4">
                <UFormField label="Status">
                  <USelect
                    v-model="form.status"
                    :items="statusOptions"
                    value-key="value"
                    label-key="label"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Category">
                  <USelect
                    v-model="form.categoryId"
                    :items="[{ label: 'Uncategorized', value: null }, ...categories.map(c => ({ label: c.name, value: c.id }))]"
                    value-key="value"
                    label-key="label"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Cover Image">
                  <ImageUpload
                    v-model="form.coverImage"
                    prefix="articles"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </UCard>

            <UButton icon="i-lucide-save" block :loading="saving" @click="save">Save Article</UButton>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
