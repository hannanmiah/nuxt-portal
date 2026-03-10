<script setup lang="ts">
import type { AdminUser, UserRole } from '~/types'

definePageMeta({ middleware: ['auth', 'admin-only'] })

const toast = useToast()
const { user: currentUser } = useAuth()

const { data: users, refresh } = await useFetch<AdminUser[]>('/api/admin/users', {
  default: () => []
})

const roleOptions: { label: string; value: UserRole }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Reporter', value: 'reporter' },
  { label: 'Viewer', value: 'viewer' },
]

const roleColors: Record<UserRole, any> = {
  admin: 'error',
  editor: 'primary',
  reporter: 'info',
  viewer: 'neutral',
}

const deleteConfirm = ref<AdminUser | null>(null)
const editingUser = ref<AdminUser | null>(null)
const editRole = ref<UserRole>('viewer')
const editAvatar = ref('')

function openEdit(user: AdminUser) {
  editingUser.value = user
  editRole.value = user.role
  editAvatar.value = user.avatar || ''
}

async function updateUser() {
  if (!editingUser.value) return
  try {
    await $fetch(`/api/admin/users/${editingUser.value.id}`, {
      method: 'PUT',
      body: { role: editRole.value, avatar: editAvatar.value || undefined }
    })
    toast.add({ title: `User updated`, color: 'success' })
    editingUser.value = null
    refresh()
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed to update user', color: 'error' })
  }
}

async function deleteUser(user: AdminUser) {
  try {
    await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    toast.add({ title: 'User deleted', color: 'success' })
    refresh()
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed to delete', color: 'error' })
  }
  deleteConfirm.value = null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <UDashboardPanel id="users">
    <template #header>
      <UDashboardNavbar title="Users" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6">
        <div class="mb-4">
          <p class="text-sm text-muted">Manage user roles and access. You cannot delete your own account.</p>
        </div>

        <div class="flex flex-col gap-3">
          <div
            v-for="u in users"
            :key="u.id"
            class="flex items-center gap-4 p-4 rounded-lg border border-default hover:bg-elevated/30 transition-colors"
          >
            <UAvatar :src="u.avatar?.startsWith('http') ? u.avatar : (u.avatar ? `/files/${u.avatar}` : undefined)" :alt="u.name" size="md" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ u.name }}</span>
                <UBadge v-if="u.id === currentUser?.id" label="You" variant="soft" size="xs" color="neutral" />
              </div>
              <p class="text-sm text-muted">{{ u.email }}</p>
              <p class="text-xs text-muted">Joined {{ formatDate(u.createdAt) }}</p>
            </div>
            <UBadge :label="u.role" :color="roleColors[u.role]" variant="soft" />
            <div class="flex items-center gap-1">
              <UButton
                icon="i-lucide-user-cog"
                size="xs"
                variant="ghost"
                square
                :disabled="u.id === currentUser?.id"
                @click="openEdit(u)"
              />
              <UButton
                icon="i-lucide-trash-2"
                size="xs"
                variant="ghost"
                color="error"
                square
                :disabled="u.id === currentUser?.id"
                @click="deleteConfirm = u"
              />
            </div>
          </div>
        </div>

        <!-- Role legend -->
        <div class="mt-8 p-4 rounded-lg bg-elevated/50 border border-default">
          <h4 class="font-semibold text-sm mb-3">Role Permissions</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div>
              <UBadge label="Admin" color="error" variant="soft" class="mb-1" />
              <p class="text-muted text-xs">Full access: manage users, publish, edit/delete all content</p>
            </div>
            <div>
              <UBadge label="Editor" color="primary" variant="soft" class="mb-1" />
              <p class="text-muted text-xs">Publish articles, edit/delete any article, manage categories</p>
            </div>
            <div>
              <UBadge label="Reporter" color="info" variant="soft" class="mb-1" />
              <p class="text-muted text-xs">Create/edit own articles, submit for review</p>
            </div>
            <div>
              <UBadge label="Viewer" color="neutral" variant="soft" class="mb-1" />
              <p class="text-muted text-xs">Read-only access to admin panel</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Edit user modal -->
  <UModal :open="!!editingUser" title="Edit User" @update:open="editingUser = null">
    <template #body>
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="editAvatar.startsWith('http') ? editAvatar : (editAvatar ? `/files/${editAvatar}` : editingUser?.avatar)"
            :alt="editingUser?.name"
            size="lg"
          />
          <div>
            <p class="font-medium">{{ editingUser?.name }}</p>
            <p class="text-sm text-muted">{{ editingUser?.email }}</p>
          </div>
        </div>
        <UFormField label="Avatar">
          <ImageUpload
            v-model="editAvatar"
            prefix="avatars"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Role">
          <USelect
            v-model="editRole"
            :items="roleOptions"
            value-key="value"
            label-key="label"
            class="w-full"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="editingUser = null">Cancel</UButton>
        <UButton @click="updateUser">Update User</UButton>
      </div>
    </template>
  </UModal>

  <!-- Delete confirm -->
  <UModal v-if="deleteConfirm" :open="!!deleteConfirm" title="Delete User" @update:open="deleteConfirm = null">
    <template #body>
      <p>Delete user <strong>{{ deleteConfirm?.name }}</strong>? This will remove all their data.</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="deleteConfirm = null">Cancel</UButton>
        <UButton color="error" @click="deleteUser(deleteConfirm!)">Delete User</UButton>
      </div>
    </template>
  </UModal>
</template>
