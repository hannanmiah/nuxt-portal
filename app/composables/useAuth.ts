import type { AuthUser, UserRole } from '~/types'

const ROLE_LEVELS: Record<UserRole, number> = {
  admin: 4,
  editor: 3,
  reporter: 2,
  viewer: 1,
}

export const useAuth = () => {
  const { user: sessionUser, loggedIn, signIn, signOut: betterSignOut, fetchSession } = useUserSession()
  const router = useRouter()

  const user = computed(() => sessionUser.value as AuthUser | null)

  const isAuthenticated = computed(() => loggedIn.value)

  const userRole = computed<UserRole | null>(() => user.value?.role ?? null)

  const hasRole = (minRole: UserRole) => {
    if (!userRole.value) return false
    return ROLE_LEVELS[userRole.value] >= ROLE_LEVELS[minRole]
  }

  const isAdmin = computed(() => hasRole('admin'))
  const isEditor = computed(() => hasRole('editor'))
  const isReporter = computed(() => hasRole('reporter'))

  const login = async (email: string, password: string) => {
    await signIn.email({ email, password })
    await fetchSession()
  }

  const logout = async () => {
    await betterSignOut()
    router.push('/login')
  }

  return {
    user,
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
