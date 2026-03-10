export default defineNuxtRouteMiddleware(() => {
  const { isEditor } = useAuth()
  if (!isEditor.value) {
    return navigateTo('/admin')
  }
})
