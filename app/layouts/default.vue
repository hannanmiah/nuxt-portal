<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const toast = useToast()
const { user, isAdmin, isEditor, logout } = useAuth()

const open = ref(false)

const links = computed(() => [[{
  label: 'Dashboard',
  icon: 'i-lucide-layout-dashboard',
  to: '/admin',
  exact: true,
  onSelect: () => { open.value = false }
}, {
  label: 'Articles',
  icon: 'i-lucide-file-text',
  to: '/admin/articles',
  onSelect: () => { open.value = false }
}, {
  label: 'Categories',
  icon: 'i-lucide-tag',
  to: '/admin/categories',
  onSelect: () => { open.value = false },
  ...(isEditor.value ? {} : { class: 'opacity-50 pointer-events-none' })
}, ...(isAdmin.value ? [{
  label: 'Users',
  icon: 'i-lucide-users',
  to: '/admin/users',
  onSelect: () => { open.value = false }
}] : []), {
  label: 'Settings',
  to: '/admin/settings',
  icon: 'i-lucide-settings',
  defaultOpen: false,
  type: 'trigger' as const,
  children: [{
    label: 'General',
    to: '/admin/settings',
    exact: true,
    onSelect: () => { open.value = false }
  }, {
    label: 'Members',
    to: '/admin/settings/members',
    onSelect: () => { open.value = false }
  }, {
    label: 'Notifications',
    to: '/admin/settings/notifications',
    onSelect: () => { open.value = false }
  }, {
    label: 'Security',
    to: '/admin/settings/security',
    onSelect: () => { open.value = false }
  }]
}], [{
  label: 'View Portal',
  icon: 'i-lucide-external-link',
  to: '/',
  target: '_blank'
}, {
  label: 'Help & Support',
  icon: 'i-lucide-info',
  to: 'https://github.com/nuxt-ui-templates/dashboard',
  target: '_blank'
}]])

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.value.flat()
}])

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') return

  toast.add({
    title: 'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Accept',
      color: 'neutral',
      variant: 'outline',
      onClick: () => { cookie.value = 'accepted' }
    }, {
      label: 'Opt out',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
