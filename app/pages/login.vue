<script setup lang="ts">
definePageMeta({ layout: false })

const { login, isAuthenticated } = useAuth()
const router = useRouter()
const route = useRoute()

if (isAuthenticated.value) {
  const redirect = route.query.redirect as string || '/'
  await navigateTo(redirect)
}

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

// Determine context: coming from admin or public portal
const isAdminRedirect = computed(() => {
  const redirect = route.query.redirect as string || ''
  return redirect.startsWith('/admin') || !redirect
})

async function handleLogin() {
  if (!form.email || !form.password) {
    error.value = 'Please enter your email and password.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await login(form.email, form.password)
    const { user } = useAuth()
    // Admins/editors/reporters go to admin, viewers/public go back to their page
    const redirect = route.query.redirect as string
    if (redirect) {
      router.push(redirect)
    } else if (user.value && ['admin', 'editor', 'reporter'].includes(user.value.role)) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Invalid email or password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-background flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <!-- Logo -->
        <div class="text-center mb-8">
          <NuxtLink to="/" class="inline-flex items-center gap-2">
            <UIcon name="i-lucide-newspaper" class="size-8 text-primary" />
            <span class="text-2xl font-bold">NewsPortal</span>
          </NuxtLink>
          <p class="text-muted text-sm mt-2">Sign in to join the conversation</p>
        </div>

        <UCard>
          <div class="flex flex-col gap-4">
            <h1 class="text-xl font-semibold text-center">Welcome back</h1>

            <UAlert
              v-if="error"
              color="error"
              variant="soft"
              :title="error"
              icon="i-lucide-circle-alert"
            />

            <UFormField label="Email">
              <UInput
                v-model="form.email"
                type="email"
                placeholder="admin@news.com"
                class="w-full"
                @keyup.enter="handleLogin"
              />
            </UFormField>

            <UFormField label="Password">
              <UInput
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                class="w-full"
                @keyup.enter="handleLogin"
              />
            </UFormField>

            <UButton block :loading="loading" @click="handleLogin">
              Sign in
            </UButton>

            <div class="text-center text-sm text-muted">
              Don't have an account?
              <NuxtLink
                :to="{ path: '/register', query: $route.query }"
                class="text-primary hover:underline ml-1"
              >Sign up</NuxtLink>
            </div>

            <div class="text-center">
              <NuxtLink to="/" class="text-sm text-muted hover:text-foreground transition-colors">
                ← Back to news portal
              </NuxtLink>
            </div>
          </div>
        </UCard>

        <!-- Demo credentials -->
        <div class="mt-4 p-3 rounded-lg bg-elevated/50 border border-default text-xs text-muted">
          <p class="font-medium mb-1">Demo credentials:</p>
          <p>Email: <code class="text-foreground">admin@news.com</code></p>
          <p>Password: <code class="text-foreground">admin123</code></p>
        </div>
      </div>
    </div>
  </UApp>
</template>
