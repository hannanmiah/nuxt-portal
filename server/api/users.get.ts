import { db, schema } from '@nuxthub/db'
export default defineEventHandler(async (event) => {
  return await db.query.users.findMany()
})
