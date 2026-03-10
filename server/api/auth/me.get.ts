export default defineEventHandler(async (event) => {
  const result = await getUserSession(event)
  return result?.user ?? null
})
