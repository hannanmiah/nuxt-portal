<script setup lang="ts">
const props = defineProps<{
  modelValue?: string | null
  prefix?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const toast = useToast()
const uploading = ref(false)
const selectedFile = ref<File | null>(null)

const preview = computed(() => resolveImageUrl(props.modelValue))

watch(selectedFile, async (file) => {
  if (!file) return
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('prefix', props.prefix || 'uploads')
    const result = await $fetch<{ pathname: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    })
    emit('update:modelValue', result.pathname)
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Upload failed', color: 'error' })
  } finally {
    uploading.value = false
    selectedFile.value = null
  }
})

function clearImage() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Current image preview -->
    <div v-if="preview && !selectedFile" class="relative group rounded-lg overflow-hidden border border-default">
      <img
        :src="preview"
        class="w-full object-cover"
        :class="prefix === 'avatars' ? 'aspect-square max-w-[120px]' : 'aspect-video'"
        alt="Preview"
      />
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <UButton icon="i-lucide-x" size="xs" color="error" variant="solid" @click="clearImage">Remove</UButton>
      </div>
    </div>

    <!-- Upload area (shown when no image or replacing) -->
    <div v-if="!preview || selectedFile">
      <UFileUpload
        v-model="selectedFile"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        icon="i-lucide-image"
        :label="uploading ? 'Uploading...' : 'Drop image here or click to upload'"
        description="JPG, PNG, WebP, GIF, SVG · Max 5MB"
        :disabled="uploading"
        class="w-full"
      />
    </div>

    <!-- Replace button when an image is already set -->
    <div v-else>
      <UFileUpload
        v-model="selectedFile"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        variant="button"
        icon="i-lucide-upload"
        :label="uploading ? 'Uploading...' : 'Replace image'"
        :disabled="uploading"
      />
    </div>
  </div>
</template>
