<script setup lang="ts">
const props = defineProps<{
  slug: string
}>()

const { user, isAuthenticated } = useAuth()
const route = useRoute()
const toast = useToast()

const { data, refresh } = await useFetch(`/api/public/articles/${props.slug}/comments`, {
  default: () => ({ comments: [], total: 0 })
})

const comments = computed(() => data.value.comments)
const total = computed(() => data.value.total)

const newComment = ref('')
const replyingTo = ref<{ id: number; authorName: string } | null>(null)
const submitting = ref(false)

function formatDate(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = (now.getTime() - date.getTime()) / 1000

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function startReply(comment: any) {
  replyingTo.value = { id: comment.id, authorName: comment.authorName }
  nextTick(() => {
    document.getElementById('comment-input')?.focus()
  })
}

function cancelReply() {
  replyingTo.value = null
}

async function submitComment() {
  if (!newComment.value.trim()) return
  submitting.value = true
  try {
    await $fetch(`/api/public/articles/${props.slug}/comments`, {
      method: 'POST',
      body: {
        content: newComment.value.trim(),
        parentId: replyingTo.value?.id || null
      }
    })
    newComment.value = ''
    replyingTo.value = null
    await refresh()
    toast.add({ title: 'Comment posted!', color: 'success', timeout: 2000 })
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed to post comment', color: 'error' })
  } finally {
    submitting.value = false
  }
}

async function deleteComment(id: number) {
  try {
    await $fetch(`/api/public/comments/${id}`, { method: 'DELETE' })
    await refresh()
    toast.add({ title: 'Comment deleted', color: 'success', timeout: 2000 })
  } catch (e: any) {
    toast.add({ title: e.data?.message || 'Failed to delete', color: 'error' })
  }
}

function canDelete(comment: any) {
  if (!user.value) return false
  return comment.authorId === user.value.id || ['admin', 'editor'].includes(user.value.role)
}
</script>

<template>
  <section class="mt-12 pt-8 border-t border-default">
    <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
      <UIcon name="i-lucide-message-circle" class="size-6" />
      Comments
      <UBadge v-if="total > 0" :label="String(total)" variant="soft" color="neutral" />
    </h2>

    <!-- Comment form (authenticated) -->
    <div v-if="isAuthenticated" class="mb-8">
      <div class="flex items-start gap-3">
        <UAvatar :src="resolveImageUrl(user?.avatar)" :alt="user?.name" size="sm" class="mt-1 flex-shrink-0" />
        <div class="flex-1">
          <!-- Reply indicator -->
          <div v-if="replyingTo" class="flex items-center gap-2 mb-2 text-sm text-muted">
            <UIcon name="i-lucide-corner-down-right" class="size-4" />
            <span>Replying to <strong>{{ replyingTo.authorName }}</strong></span>
            <UButton size="xs" variant="ghost" icon="i-lucide-x" square @click="cancelReply" />
          </div>
          <UTextarea
            id="comment-input"
            v-model="newComment"
            :placeholder="replyingTo ? `Reply to ${replyingTo.authorName}...` : 'Share your thoughts...'"
            :rows="3"
            class="w-full"
            @keydown.ctrl.enter="submitComment"
            @keydown.meta.enter="submitComment"
          />
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-muted">{{ newComment.length }}/2000 · Ctrl+Enter to submit</span>
            <UButton
              size="sm"
              icon="i-lucide-send"
              :loading="submitting"
              :disabled="!newComment.trim()"
              @click="submitComment"
            >
              {{ replyingTo ? 'Reply' : 'Post comment' }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Login prompt (guests) -->
    <div v-else class="mb-8 p-4 rounded-xl border border-default bg-elevated/30 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-lock" class="size-5 text-muted" />
        <p class="text-sm text-muted">Sign in to join the conversation and leave a comment.</p>
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <UButton
          :to="{ path: '/login', query: { redirect: route.fullPath } }"
          variant="outline"
          size="sm"
        >Sign in</UButton>
        <UButton
          :to="{ path: '/register', query: { redirect: route.fullPath } }"
          size="sm"
        >Join free</UButton>
      </div>
    </div>

    <!-- Comments list -->
    <div v-if="comments.length" class="flex flex-col gap-6">
      <!-- Top-level comment -->
      <div v-for="comment in comments" :key="comment.id" class="flex flex-col gap-4">
        <div class="flex items-start gap-3">
          <UAvatar :src="resolveImageUrl(comment.authorAvatar)" :alt="comment.authorName" size="sm" class="mt-0.5 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class="font-semibold text-sm">{{ comment.authorName }}</span>
              <span class="text-xs text-muted">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p class="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
            <div class="flex items-center gap-3 mt-2">
              <UButton
                v-if="isAuthenticated"
                size="xs"
                variant="ghost"
                icon="i-lucide-corner-down-right"
                @click="startReply(comment)"
              >Reply</UButton>
              <UButton
                v-if="canDelete(comment)"
                size="xs"
                variant="ghost"
                color="error"
                icon="i-lucide-trash-2"
                @click="deleteComment(comment.id)"
              >Delete</UButton>
            </div>
          </div>
        </div>

        <!-- Replies -->
        <div v-if="comment.replies?.length" class="ml-10 flex flex-col gap-4 border-l-2 border-default pl-4">
          <div v-for="reply in comment.replies" :key="reply.id" class="flex items-start gap-3">
            <UAvatar :src="resolveImageUrl(reply.authorAvatar)" :alt="reply.authorName" size="xs" class="mt-0.5 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-2 flex-wrap">
                <span class="font-semibold text-sm">{{ reply.authorName }}</span>
                <span class="text-xs text-muted">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <p class="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{{ reply.content }}</p>
              <div class="flex items-center gap-3 mt-2">
                <UButton
                  v-if="canDelete(reply)"
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-trash-2"
                  @click="deleteComment(reply.id)"
                >Delete</UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-10 text-muted">
      <UIcon name="i-lucide-message-circle" class="size-12 mx-auto mb-3 opacity-20" />
      <p class="font-medium">No comments yet.</p>
      <p class="text-sm mt-1">Be the first to share your thoughts!</p>
    </div>
  </section>
</template>
