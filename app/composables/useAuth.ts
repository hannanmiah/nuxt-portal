import type { AuthUser, UserRole } from '~/types'

const ROLE_LEVELS: Record<UserRole, number> = {
  admin: 4,
  editor: 3,
  reporter: 2,
  viewer: 1,
}

export const useAuth = () => {
  const { user, fetch: fetchSession, clear } = useUserSession()
  const router = useRouter()

  const authUser = computed(() => user.value as AuthUser | null)

  const isAuthenticated = computed(() => !!authUser.value)

  const userRole = computed<UserRole | null>(() => authUser.value?.role ?? null)

  const hasRole = (minRole: UserRole) => {
    if (!userRole.value) return false
    return ROLE_LEVELS[userRole.value] >= ROLE_LEVELS[minRole]
  }

  const isAdmin = computed(() => hasRole('admin'))
  const isEditor = computed(() => hasRole('editor'))
  const isReporter = computed(() => hasRole('reporter'))

  const login = async (email: string, password: string) => {
    await $fetch('/api/auth/login', { method: 'POST', body: { email, password } })
    await fetchSession()
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await clear()
    router.push('/login')
  }

  return {
    user: authUser,
    isAuthenticated,
    userRole,
    hasRole,
    isAdmin,
    isEditor,
    isReporter,
    login,
    logout,
  }
}
