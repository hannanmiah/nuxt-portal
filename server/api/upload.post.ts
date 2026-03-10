import { blob, ensureBlob } from '@nuxthub/blob'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const form = await readFormData(event)
  const file = form.get('file') as File
  const prefix = (form.get('prefix') as string) || 'uploads'

  if (!file || !file.size) {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  ensureBlob(file, {
    maxSize: '5MB',
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  })

  const result = await blob.put(file.name, file, {
    addRandomSuffix: true,
    prefix,
  })

  return { pathname: result.pathname, url: result.url }
})
