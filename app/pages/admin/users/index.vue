<script setup lang="ts">
import type { AdminUser, UserRole } from '~/types'

useHead({ title: 'Users' })

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

// Search & filter
const searchQuery = ref('')
const filterRole = ref<UserRole | 'all'>('all')

const filterRoleOptions = [
  { label: 'All Roles', value: 'all' },
  ...roleOptions,
]

const filteredUsers = computed(() => {
  return (users.value ?? []).filter((u) => {
    const matchesSearch = !searchQuery.value
      || u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = filterRole.value === 'all' || u.role === filterRole.value
    return matchesSearch && matchesRole
  })
})

// Edit user
const deleteConfirm = ref<AdminUser | null>(null)
const editingUser = ref<AdminUser | null>(null)
const editName = ref('')
const editRole = ref<UserRole>('viewer')
const editAvatar = ref('')

function openEdit(user: AdminUser) {
  editingUser.value = user
  editName.value = user.name
  editRole.value = user.role
  editAvatar.value = user.avatar || ''
}

async function updateUser() {
  if (!editingUser.value) return
  try {
    await $fetch(`/api/admin/users/${editingUser.value.id}`, {
      method: 'PUT',
      body: {
        name: editName.value,
        role: editRole.value,
        avatar: editAvatar.value || undefined,
      }
    })
    toast.add({ title: 'User updated', color: 'success' })
    editingUser.value = null
    refresh()
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed to update user', color: 'error' })
  }
}

// Delete user
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

// Create user
const createModal = ref(false)
const creating = ref(false)
const createForm = reactive({ name: '', email: '', password: '', role: 'viewer' as UserRole })

function openCreate() {
  createForm.name = ''
  createForm.email = ''
  createForm.password = ''
  createForm.role = 'viewer'
  createModal.value = true
}

async function createUser() {
  if (!createForm.name || !createForm.email || !createForm.password) {
    toast.add({ title: 'Name, email and password are required', color: 'error' })
    return
  }
  creating.value = true
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: { ...createForm },
    })
    toast.add({ title: `User ${createForm.name} created`, color: 'success' })
    createModal.value = false
    refresh()
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed to create user', color: 'error' })
  } finally {
    creating.value = false
  }
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
        <template #right>
          <UButton icon="i-lucide-user-plus" label="New User" @click="openCreate" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6">

        <!-- Search & filter -->
        <div class="flex flex-col sm:flex-row gap-3 mb-4">
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Search by name or email..."
            class="flex-1"
          />
          <USelect
            v-model="filterRole"
            :items="filterRoleOptions"
            value-key="value"
            label-key="label"
            class="w-full sm:w-44"
          />
        </div>

        <!-- User list -->
        <div class="flex flex-col gap-3">
          <div
            v-for="u in filteredUsers"
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
          <p v-if="filteredUsers.length === 0" class="text-sm text-muted text-center py-8">
            No users match your search.
          </p>
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
              <p class="text-muted text-xs">Read-only access to the site</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Create user modal -->
  <UModal :open="createModal" title="New User" @update:open="createModal = $event">
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Name" required>
          <UInput v-model="createForm.name" placeholder="Full name" class="w-full" />
        </UFormField>
        <UFormField label="Email" required>
          <UInput v-model="createForm.email" type="email" placeholder="user@example.com" class="w-full" />
        </UFormField>
        <UFormField label="Password" required>
          <UInput v-model="createForm.password" type="password" placeholder="Min. 8 characters" class="w-full" />
        </UFormField>
        <UFormField label="Role">
          <USelect
            v-model="createForm.role"
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
        <UButton variant="ghost" @click="createModal = false">Cancel</UButton>
        <UButton :loading="creating" @click="createUser">Create User</UButton>
      </div>
    </template>
  </UModal>

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
        <UFormField label="Name">
          <UInput v-model="editName" placeholder="Full name" class="w-full" />
        </UFormField>
        <UFormField label="Avatar">
          <ImageUpload v-model="editAvatar" prefix="avatars" class="w-full" />
        </UFormField>
        <UFormField label="Role">
          <USelect
            v-model="editRole"
            :items="roleOptions"
            value-key="value"
            label-key="label"
            class="w-full"
            :disabled="editingUser?.id === currentUser?.id"
          />
          <p v-if="editingUser?.id === currentUser?.id" class="text-xs text-muted mt-1">
            You cannot change your own role.
          </p>
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
      <p>Delete user <strong>{{ deleteConfirm?.name }}</strong>? This action cannot be undone.</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="deleteConfirm = null">Cancel</UButton>
        <UButton color="error" @click="deleteUser(deleteConfirm!)">Delete User</UButton>
      </div>
    </template>
  </UModal>
</template>

