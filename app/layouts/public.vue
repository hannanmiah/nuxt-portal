<script setup lang="ts">
const { data: categories } = await useFetch('/api/public/categories')
const route = useRoute()
const mobileMenuOpen = ref(false)
const { user, isAuthenticated, logout } = useAuth()
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-background text-foreground flex flex-col">
      <!-- Header -->
      <header class="sticky top-0 z-50 border-b border-default bg-background/95 backdrop-blur">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <NuxtLink to="/" class="flex items-center gap-2">
              <UIcon name="i-lucide-newspaper" class="size-7 text-primary" />
              <span class="text-xl font-bold tracking-tight">NewsPortal</span>
            </NuxtLink>

            <!-- Desktop nav -->
            <nav class="hidden md:flex items-center gap-1">
              <NuxtLink
                v-for="cat in categories"
                :key="cat.id"
                :to="`/category/${cat.slug}`"
                class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:bg-elevated"
                :class="route.params.slug === cat.slug ? 'text-primary bg-primary/10' : 'text-muted'"
              >
                {{ cat.name }}
              </NuxtLink>
            </nav>

            <!-- Right actions -->
            <div class="flex items-center gap-2">
              <!-- Authenticated user -->
              <template v-if="isAuthenticated">
                <UDropdownMenu
                  :items="[[
                    { type: 'label', label: user?.name, avatar: { src: resolveImageUrl(user?.avatar), alt: user?.name } },
                    ...(user?.role !== 'viewer' ? [{ label: 'Admin Panel', icon: 'i-lucide-layout-dashboard', to: '/admin' }] : []),
                    { label: 'Sign out', icon: 'i-lucide-log-out', color: 'error', onSelect: () => logout() }
                  ]]"
                >
                  <UAvatar :src="resolveImageUrl(user?.avatar)" :alt="user?.name" size="sm" class="cursor-pointer hover:ring-2 hover:ring-primary transition-all" />
                </UDropdownMenu>
              </template>

              <!-- Guest -->
              <template v-else>
                <UButton
                  :to="{ path: '/login', query: route.path !== '/' ? { redirect: route.fullPath } : {} }"
                  variant="ghost"
                  size="sm"
                >
                  Sign in
                </UButton>
                <UButton
                  :to="{ path: '/register', query: route.path !== '/' ? { redirect: route.fullPath } : {} }"
                  size="sm"
                >
                  Join free
                </UButton>
              </template>

              <UButton
                icon="i-lucide-menu"
                variant="ghost"
                class="md:hidden"
                @click="mobileMenuOpen = !mobileMenuOpen"
              />
            </div>
          </div>
        </div>

        <!-- Mobile menu -->
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-default bg-background px-4 py-3">
          <nav class="flex flex-col gap-1">
            <NuxtLink
              v-for="cat in categories"
              :key="cat.id"
              :to="`/category/${cat.slug}`"
              class="px-3 py-2 text-sm font-medium rounded-md hover:bg-elevated"
              @click="mobileMenuOpen = false"
            >
              {{ cat.name }}
            </NuxtLink>
          </nav>
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-1">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="border-t border-default bg-elevated/50 py-10 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-newspaper" class="size-5 text-primary" />
              <span class="font-semibold">NewsPortal</span>
            </div>
            <p class="text-sm text-muted">© {{ new Date().getFullYear() }} NewsPortal. All rights reserved.</p>
            <NuxtLink to="/admin" class="text-sm text-muted hover:text-foreground transition-colors">
              Admin Panel
            </NuxtLink>
          </div>
        </div>
      </footer>
    </div>
  </UApp>
</template>
