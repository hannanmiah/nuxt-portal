<script setup lang="ts">
import type { Category } from '~/types'

definePageMeta({ middleware: ['auth', 'editor-only'] })

const toast = useToast()

const { data: categories, refresh } = await useFetch<Category[]>('/api/admin/categories', {
  default: () => []
})

const showForm = ref(false)
const editingCategory = ref<Category | null>(null)
const deleteConfirm = ref<Category | null>(null)
const saving = ref(false)

const form = reactive({ name: '', description: '' })

function openCreate() {
  editingCategory.value = null
  form.name = ''
  form.description = ''
  showForm.value = true
}

function openEdit(cat: Category) {
  editingCategory.value = cat
  form.name = cat.name
  form.description = cat.description || ''
  showForm.value = true
}

async function save() {
  if (!form.name) {
    toast.add({ title: 'Category name is required', color: 'error' })
    return
  }
  saving.value = true
  try {
    if (editingCategory.value) {
      await $fetch(`/api/admin/categories/${editingCategory.value.id}`, { method: 'PUT', body: form })
      toast.add({ title: 'Category updated', color: 'success' })
    } else {
      await $fetch('/api/admin/categories', { method: 'POST', body: form })
      toast.add({ title: 'Category created', color: 'success' })
    }
    showForm.value = false
    refresh()
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed to save category', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function deleteCategory(cat: Category) {
  try {
    await $fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })
    toast.add({ title: 'Category deleted', color: 'success' })
    refresh()
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed to delete', color: 'error' })
  }
  deleteConfirm.value = null
}
</script>

<template>
  <UDashboardPanel id="categories">
    <template #header>
      <UDashboardNavbar title="Categories" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-plus" @click="openCreate">New Category</UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6">
        <div v-if="!categories.length" class="text-center py-16 text-muted">
          <UIcon name="i-lucide-tag" class="size-16 mx-auto mb-4 opacity-30" />
          <p class="text-lg font-medium">No categories yet</p>
          <UButton class="mt-4" icon="i-lucide-plus" @click="openCreate">Create your first category</UButton>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard
            v-for="cat in categories"
            :key="cat.id"
            class="group"
          >
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold">{{ cat.name }}</h3>
                <p class="text-sm text-muted mt-1">{{ cat.description || 'No description' }}</p>
                <UBadge :label="`/${cat.slug}`" variant="soft" color="neutral" size="xs" class="mt-2" />
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <UButton icon="i-lucide-edit" size="xs" variant="ghost" square @click="openEdit(cat)" />
                <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error" square @click="deleteConfirm = cat" />
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Create/Edit modal -->
  <UModal :open="showForm" :title="editingCategory ? 'Edit Category' : 'New Category'" @update:open="showForm = $event">
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Name" required>
          <UInput v-model="form.name" placeholder="Category name..." class="w-full" />
        </UFormField>
        <UFormField label="Description">
          <UTextarea v-model="form.description" placeholder="Optional description..." class="w-full" />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="showForm = false">Cancel</UButton>
        <UButton :loading="saving" @click="save">{{ editingCategory ? 'Update' : 'Create' }}</UButton>
      </div>
    </template>
  </UModal>

  <!-- Delete confirm modal -->
  <UModal v-if="deleteConfirm" :open="!!deleteConfirm" title="Delete Category" @update:open="deleteConfirm = null">
    <template #body>
      <p>Delete category <strong>{{ deleteConfirm?.name }}</strong>? Articles in this category will become uncategorized.</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="deleteConfirm = null">Cancel</UButton>
        <UButton color="error" @click="deleteCategory(deleteConfirm!)">Delete</UButton>
      </div>
    </template>
  </UModal>
</template>
