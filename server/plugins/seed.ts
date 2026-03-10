import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineNitroPlugin(async () => {
  const [existingAdmin] = await db.select().from(schema.user).where(eq((schema.user as any).role, 'admin')).limit(1)
  if (!existingAdmin) {
    const auth = serverAuth()
    await auth.api.signUpEmail({
      body: {
        name: 'Admin User',
        email: 'admin@news.com',
        password: 'admin123',
      },
    })
    // Set role and avatar on the created user
    const [newUser] = await db.select().from(schema.user).where(eq(schema.user.email, 'admin@news.com')).limit(1)
    if (newUser) {
      await db.update(schema.user).set({
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      } as any).where(eq(schema.user.id, newUser.id))
    }
    console.log('✅ Initial admin user created: admin@news.com / admin123')

    // Seed sample categories
    const categoryData = [
      { name: 'Politics', slug: 'politics', description: 'Political news and analysis' },
      { name: 'Technology', slug: 'technology', description: 'Tech news and reviews' },
      { name: 'Sports', slug: 'sports', description: 'Sports news and updates' },
      { name: 'Business', slug: 'business', description: 'Business and economy' },
      { name: 'Entertainment', slug: 'entertainment', description: 'Entertainment and culture' },
      { name: 'World', slug: 'world', description: 'International news' },
    ]
    for (const cat of categoryData) {
      await db.insert(schema.categories).values({ ...cat, createdAt: new Date() }).onConflictDoNothing()
    }
    console.log('✅ Sample categories seeded')
  }
})
