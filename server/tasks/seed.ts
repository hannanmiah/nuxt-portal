import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineTask({
  meta: {
    name: 'seed',
    description: 'Seed the database with users, categories, articles and comments',
  },
  async run() {
    const [existingAdmin] = await db
      .select()
      .from(schema.user)
      .where(eq((schema.user as any).role, 'admin'))
      .limit(1)

    if (existingAdmin) {
      return { result: 'Database already seeded — skipping.' }
    }

    const auth = serverAuth()
    const now = new Date()

    // ── Users ──────────────────────────────────────────────────────────────

    await auth.api.signUpEmail({ body: { name: 'Admin User', email: 'admin@news.com', password: 'admin123' } })
    const [admin] = await db.select().from(schema.user).where(eq(schema.user.email, 'admin@news.com')).limit(1)
    await db.update(schema.user)
      .set({ role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' } as any)
      .where(eq(schema.user.id, admin.id))

    await auth.api.signUpEmail({ body: { name: 'Jane Editor', email: 'editor@news.com', password: 'editor123' } })
    const [editor] = await db.select().from(schema.user).where(eq(schema.user.email, 'editor@news.com')).limit(1)
    await db.update(schema.user)
      .set({ role: 'editor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor' } as any)
      .where(eq(schema.user.id, editor.id))

    await auth.api.signUpEmail({ body: { name: 'John Reporter', email: 'reporter@news.com', password: 'reporter123' } })
    const [reporter] = await db.select().from(schema.user).where(eq(schema.user.email, 'reporter@news.com')).limit(1)
    await db.update(schema.user)
      .set({ role: 'reporter', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=reporter' } as any)
      .where(eq(schema.user.id, reporter.id))

    console.log('✅ Users seeded')

    // ── Categories ─────────────────────────────────────────────────────────

    const categoryRows = [
      { name: 'Politics', slug: 'politics', description: 'Political news and analysis' },
      { name: 'Technology', slug: 'technology', description: 'Tech news and reviews' },
      { name: 'Sports', slug: 'sports', description: 'Sports news and updates' },
      { name: 'Business', slug: 'business', description: 'Business and economy' },
      { name: 'Entertainment', slug: 'entertainment', description: 'Entertainment and culture' },
      { name: 'World', slug: 'world', description: 'International news' },
    ]
    for (const cat of categoryRows) {
      await db.insert(schema.categories).values({ ...cat, createdAt: now }).onConflictDoNothing()
    }
    const cats = await db.select().from(schema.categories)
    const catId = Object.fromEntries(cats.map(c => [c.slug, c.id]))

    console.log('✅ Categories seeded')

    // ── Articles ───────────────────────────────────────────────────────────

    const day = (n: number) => new Date(now.getTime() - n * 86_400_000)

    const articleRows = [
      {
        title: 'Global Leaders Gather for Climate Summit 2025',
        slug: 'global-leaders-climate-summit-2025',
        excerpt: 'World leaders met in Geneva to discuss new climate commitments and carbon reduction targets.',
        content: 'World leaders from over 190 countries gathered in Geneva this week for the landmark Climate Summit 2025.\n\nThe summit marks a pivotal moment in global efforts to address rising temperatures and extreme weather events.\n\nKey agreements reached include a 50% reduction in carbon emissions by 2035 and a $500 billion green energy fund.',
        categoryId: catId['politics'], authorId: admin.id, status: 'published' as const, publishedAt: day(1),
      },
      {
        title: 'Tech Giants Unveil Next-Generation AI Chips',
        slug: 'tech-giants-ai-chips-2025',
        excerpt: 'Silicon Valley\'s biggest companies announced breakthrough AI processing chips promising 10x performance gains.',
        content: 'In a series of announcements this week, leading technology companies unveiled their latest AI chip architectures.\n\nThe new chips feature advanced neural processing units capable of handling complex machine learning workloads at unprecedented speeds.\n\nIndustry analysts predict these advances will accelerate AI adoption across healthcare, finance, and transportation.',
        categoryId: catId['technology'], authorId: editor.id, status: 'published' as const, publishedAt: day(2),
      },
      {
        title: 'Champions League: Dramatic Final Goes to Penalties',
        slug: 'champions-league-final-penalties',
        excerpt: 'An unforgettable Champions League final ended in a penalty shootout after a 2-2 draw after extra time.',
        content: 'The Champions League final delivered one of the most dramatic conclusions in the tournament\'s history.\n\nBoth teams were level at 2-2 after 120 minutes of play, with the title ultimately decided from the spot.\n\nFans around the world were treated to a spectacle of skill, determination, and raw emotion.',
        categoryId: catId['sports'], authorId: reporter.id, status: 'published' as const, publishedAt: day(3),
      },
      {
        title: 'Central Bank Raises Interest Rates Amid Inflation Concerns',
        slug: 'central-bank-interest-rates-inflation',
        excerpt: 'The central bank announced a 0.25% rate hike in response to persistent inflation pressures.',
        content: 'The central bank announced its latest monetary policy decision, raising the benchmark interest rate by 25 basis points.\n\nThe decision reflects ongoing concerns about inflation, which remains above the 2% target for the sixth consecutive quarter.\n\nEconomists are divided on the impact, with some warning of potential cooling in consumer spending.',
        categoryId: catId['business'], authorId: admin.id, status: 'published' as const, publishedAt: day(4),
      },
      {
        title: 'New Streaming Series Breaks Records with Season Premiere',
        slug: 'streaming-series-breaks-records-premiere',
        excerpt: 'The debut episode of the new thriller series attracted 45 million viewers in its first weekend.',
        content: 'A new streaming thriller series has shattered viewership records, attracting over 45 million households in its opening weekend.\n\nThe series, praised for its tense storytelling and production values, has already been renewed for a second season.\n\nCritics are calling it one of the most compelling television debuts in recent memory.',
        categoryId: catId['entertainment'], authorId: editor.id, status: 'published' as const, publishedAt: day(5),
      },
      {
        title: 'Earthquake Hits Pacific Region, Rescue Operations Underway',
        slug: 'earthquake-pacific-region-rescue-operations',
        excerpt: 'A magnitude 7.2 earthquake struck the Pacific coast, triggering emergency response efforts.',
        content: 'A powerful 7.2 magnitude earthquake struck the Pacific coast region early this morning, triggering widespread emergency response efforts.\n\nAuthorities have deployed rescue teams to affected areas, with reports of structural damage in several coastal towns.\n\nInternational aid organizations have mobilized resources to support relief operations.',
        categoryId: catId['world'], authorId: reporter.id, status: 'published' as const, publishedAt: day(6),
      },
      {
        title: 'Electric Vehicle Sales Surge 40% Year on Year',
        slug: 'electric-vehicle-sales-surge',
        excerpt: 'Global EV sales hit a new record, driven by falling battery costs and new model launches.',
        content: 'Global electric vehicle sales surged 40% year-on-year in the latest quarterly report, reaching a new all-time record.\n\nThe growth was driven by falling battery costs, expanded charging infrastructure, and a wave of new models from established automakers.\n\nAnalysts predict EV sales will surpass traditional combustion engine vehicles by 2030.',
        categoryId: catId['technology'], authorId: admin.id, status: 'draft' as const, publishedAt: null,
      },
      {
        title: 'National Budget Proposal Sparks Parliamentary Debate',
        slug: 'national-budget-proposal-parliament',
        excerpt: 'The government\'s latest budget proposal has ignited fierce debate, with opposition calling for amendments.',
        content: 'The government\'s annual budget proposal has sparked intense debate in parliament, with opposition parties calling for significant amendments.\n\nKey contentious areas include proposed cuts to social welfare programs and increased spending on infrastructure.\n\nThe budget must pass before the fiscal year begins next month.',
        categoryId: catId['politics'], authorId: editor.id, status: 'review' as const, publishedAt: null,
      },
    ]

    for (const article of articleRows) {
      await db.insert(schema.articles).values({ ...article, createdAt: now, updatedAt: now }).onConflictDoNothing()
    }

    console.log('✅ Articles seeded (6 published, 1 draft, 1 review)')

    // ── Comments ───────────────────────────────────────────────────────────

    const [climateArticle] = await db.select().from(schema.articles).where(eq(schema.articles.slug, 'global-leaders-climate-summit-2025')).limit(1)
    const [techArticle] = await db.select().from(schema.articles).where(eq(schema.articles.slug, 'tech-giants-ai-chips-2025')).limit(1)

    if (climateArticle) {
      for (const content of [
        'This summit marks a critical turning point. Real action is long overdue.',
        'The $500 billion fund announcement is significant, but implementation will be the real challenge.',
        "Agreed. Past summits have promised much but delivered little. Let's hope this time is different.",
      ]) {
        await db.insert(schema.comments).values({ articleId: climateArticle.id, authorId: editor.id, content, parentId: null, createdAt: now, updatedAt: now })
      }
    }

    if (techArticle) {
      for (const content of [
        'The 10x performance gain is remarkable. This will change everything in AI development.',
        'Excited to see how this impacts healthcare AI applications specifically.',
      ]) {
        await db.insert(schema.comments).values({ articleId: techArticle.id, authorId: reporter.id, content, parentId: null, createdAt: now, updatedAt: now })
      }
    }

    console.log('✅ Comments seeded')

    return {
      result: [
        '🎉 Database seeded successfully!',
        '   admin@news.com    / admin123',
        '   editor@news.com   / editor123',
        '   reporter@news.com / reporter123',
      ].join('\n'),
    }
  },
})
