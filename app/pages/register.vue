<script setup lang="ts">
definePageMeta({ layout: false })

const { isAuthenticated } = useAuth()
const router = useRouter()
const route = useRoute()

if (isAuthenticated.value) {
  const redirect = route.query.redirect as string || '/'
  await navigateTo(redirect)
}

const form = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  if (!form.name || !form.email || !form.password) {
    error.value = 'All fields are required.'
    return
  }
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match.'
    return
  }
  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { name: form.name, email: form.email, password: form.password }
    })
    // Auto-login after register
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: form.email, password: form.password }
    })
    const { fetch: refreshSession } = useUserSession()
    await refreshSession()
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  } catch (e: any) {
    error.value = e.data?.message || 'Registration failed. Please try again.'
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
          <p class="text-muted text-sm mt-2">Create an account to join the conversation</p>
        </div>

        <UCard>
          <div class="flex flex-col gap-4">
            <h1 class="text-xl font-semibold text-center">Create account</h1>

            <UAlert
              v-if="error"
              color="error"
              variant="soft"
              :title="error"
              icon="i-lucide-circle-alert"
            />

            <UFormField label="Display Name">
              <UInput
                v-model="form.name"
                placeholder="Your name"
                class="w-full"
                @keyup.enter="handleRegister"
              />
            </UFormField>

            <UFormField label="Email">
              <UInput
                v-model="form.email"
                type="email"
                placeholder="you@example.com"
                class="w-full"
                @keyup.enter="handleRegister"
              />
            </UFormField>

            <UFormField label="Password">
              <UInput
                v-model="form.password"
                type="password"
                placeholder="At least 6 characters"
                class="w-full"
                @keyup.enter="handleRegister"
              />
            </UFormField>

            <UFormField label="Confirm Password">
              <UInput
                v-model="form.confirmPassword"
                type="password"
                placeholder="Repeat your password"
                class="w-full"
                @keyup.enter="handleRegister"
              />
            </UFormField>

            <UButton block :loading="loading" @click="handleRegister">
              Create account
            </UButton>

            <div class="text-center text-sm text-muted">
              Already have an account?
              <NuxtLink
                :to="{ path: '/login', query: $route.query }"
                class="text-primary hover:underline ml-1"
              >Sign in</NuxtLink>
            </div>

            <div class="text-center">
              <NuxtLink to="/" class="text-sm text-muted hover:text-foreground transition-colors">
                ← Back to news portal
              </NuxtLink>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UApp>
</template>
