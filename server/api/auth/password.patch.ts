export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const { currentPassword, newPassword } = await readBody(event)

  if (!currentPassword || !newPassword) {
    throw createError({ statusCode: 400, message: 'Current and new passwords are required' })
  }
  if (currentPassword === newPassword) {
    throw createError({ statusCode: 400, message: 'New password must differ from current password' })
  }

  const auth = serverAuth()
  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: false },
      headers: event.headers,
    })
  } catch {
    throw createError({ statusCode: 401, message: 'Current password is incorrect' })
  }

  return { message: 'Password updated successfully' }
})
