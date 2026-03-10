<script setup lang="ts">

import * as z from 'zod'
import type { FormSubmitEvent, FormError } from '@nuxt/ui'

const toast = useToast()

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Must be at least 8 characters'),
  newPassword: z.string().min(8, 'Must be at least 8 characters'),
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  currentPassword: '',
  newPassword: '',
})

const saving = ref(false)

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  if (state.currentPassword && state.newPassword && state.currentPassword === state.newPassword) {
    return [{ name: 'newPassword', message: 'New password must differ from current password' }]
  }
  return []
}

async function onSubmit(event: FormSubmitEvent<PasswordSchema>) {
  saving.value = true
  try {
    await $fetch('/api/auth/password', {
      method: 'PATCH',
      body: event.data,
    })
    toast.add({ title: 'Password updated successfully', color: 'success' })
    password.currentPassword = ''
    password.newPassword = ''
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed to update password', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UPageCard
    title="Password"
    description="Confirm your current password before setting a new one."
    variant="subtle"
  >
    <UForm
      :schema="passwordSchema"
      :state="password"
      :validate="validate"
      class="flex flex-col gap-4 max-w-xs"
      @submit="onSubmit"
    >
      <UFormField name="currentPassword" label="Current password">
        <UInput
          v-model="password.currentPassword"
          type="password"
          placeholder="Current password"
          class="w-full"
        />
      </UFormField>

      <UFormField name="newPassword" label="New password">
        <UInput
          v-model="password.newPassword"
          type="password"
          placeholder="New password"
          class="w-full"
        />
      </UFormField>

      <UButton label="Update password" :loading="saving" type="submit" class="w-fit" />
    </UForm>
  </UPageCard>

  <UPageCard
    title="Account"
    description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
    class="bg-gradient-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <UButton label="Delete account" color="error" />
    </template>
  </UPageCard>
</template>

