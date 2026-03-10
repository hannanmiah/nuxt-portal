<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin-only'] })

import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { user, login } = useAuth()
const { fetchSession } = useUserSession()
const toast = useToast()

const profileSchema = z.object({
  name: z.string().min(2, 'Must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  avatar: z.string().optional(),
})

type ProfileSchema = z.output<typeof profileSchema>

const profile = reactive<Partial<ProfileSchema>>({
  name: user.value?.name || '',
  email: user.value?.email || '',
  avatar: user.value?.avatar || '',
})

const saving = ref(false)

async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  saving.value = true
  try {
    await $fetch('/api/auth/profile', {
      method: 'PATCH',
      body: event.data,
    })
    await fetchSession()
    toast.add({ title: 'Profile updated', color: 'success' })
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed to update profile', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UForm
    id="settings"
    :schema="profileSchema"
    :state="profile"
    @submit="onSubmit"
  >
    <UPageCard
      title="Profile"
      description="These details will be visible on your articles and comments."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        label="Save changes"
        color="neutral"
        type="submit"
        :loading="saving"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="name"
        label="Name"
        description="Your display name shown on articles and comments."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profile.name" autocomplete="off" class="w-full max-w-xs" />
      </UFormField>

      <USeparator />

      <UFormField
        name="email"
        label="Email"
        description="Used to sign in and for notifications."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profile.email" type="email" autocomplete="off" class="w-full max-w-xs" />
      </UFormField>

      <USeparator />

      <UFormField
        name="avatar"
        label="Avatar"
        description="JPG, PNG, WebP or GIF. Max 5MB."
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <div class="flex items-start gap-4">
          <UAvatar
            :src="resolveImageUrl(profile.avatar)"
            :alt="profile.name"
            size="xl"
          />
          <ImageUpload
            v-model="profile.avatar"
            prefix="avatars"
            class="w-56"
          />
        </div>
      </UFormField>
    </UPageCard>
  </UForm>
</template>

