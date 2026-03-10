# Copilot Instructions

## Commands

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Production build
pnpm generate     # Static site generation
pnpm preview      # Preview production build
```

No test or lint scripts are configured.

## Architecture

This is a **Nuxt 4 dashboard application** using NuxtHub for SQLite-backed deployment.

- `app/` — Frontend (Nuxt 4 `app/` directory convention). All frontend imports use the `~/` alias resolving to `app/`.
- `server/api/` — Nitro API routes. File naming: `[resource].[method].ts` (e.g., `users.get.ts`).
- `server/db/schema.ts` — Drizzle ORM table definitions for SQLite.
- `server/db/migrations/sqlite/` — Drizzle migration files (auto-generated; do not edit manually).

**Data flow**: Pages fetch from `/api/*` endpoints via `useFetch`. Server handlers access the database using `db` and `schema` imported from `@nuxthub/db`. The hub SQLite database is configured via `hub: { db: 'sqlite' }` in `nuxt.config.ts`.

**Layouts**: `app/layouts/default.vue` wraps all pages with the `UDashboardGroup` + `UDashboardSidebar` shell. New pages should use the `UDashboardPanel` component as the top-level wrapper.

## Key Conventions

**UI components**: Use `@nuxt/ui` v4 components (`UButton`, `UTable`, `UBadge`, etc.). All Nuxt UI components are auto-imported. Nuxt UI v4 uses Tailwind CSS v4 — no `tailwind.config.js`; theme customization is done in `app/assets/css/main.css` with `@theme static {}` blocks.

**Icons**: Lucide icons (`i-lucide-*`) for UI, Simple Icons (`i-simple-icons-*`) for brand logos. Both sets are available via Iconify.

**Component naming**: Components are prefixed by their feature context:

- `Home*` → dashboard home widgets
- `Customers*` → customers page modals/tables
- `Inbox*` → inbox components
- `Settings*` → settings panels

**Client/server component split**: Use `.client.vue` / `.server.vue` suffixes when a component must run exclusively on one side (e.g., `HomeChart.client.vue` for interactive charts, `HomeChart.server.vue` for SSR version).

**Shared composables**: Wrap composables with `createSharedComposable` from `@vueuse/core` to share reactive state across the component tree without a store. See `app/composables/useDashboard.ts`.

**Keyboard shortcuts**: Use `defineShortcuts` (auto-imported from Nuxt UI) inside composables for global keyboard bindings (e.g., `g-h` for navigate home).

**Data tables**: Complex tables use `@tanstack/table-core` with `UTable`. Resolve Nuxt UI components explicitly in `<script setup>` with `resolveComponent('UTable')` etc. when used inside TanStack cell render functions (`h()`).

**Types**: All shared TypeScript types live in `app/types/index.d.ts`. Import with `import type { ... } from '~/types'`.

**Utilities**: Small pure helpers (e.g., `randomInt`, `randomFrom`) go in `app/utils/index.ts` and are auto-imported.

## Database

- **Database Dialect**: The database dialect is set in the `nuxt.config.ts` file, within the `hub.db` option or `hub.db.dialect` property.
- **Drizzle Config**: Don't generate the `drizzle.config.ts` file manually, it is generated automatically by NuxtHub.
- **Generate Migrations**: Use `npx nuxt db generate` to automatically generate database migrations from schema changes
- **Never Write Manual Migrations**: Do not manually create SQL migration files in the `server/db/migrations/` directory
- **Workflow**:
  1. Create or modify the database schema in `server/db/schema.ts` or any other schema file in the `server/db/schema/` directory
  2. Run `npx nuxt db generate` to generate the migration
  3. Run `npx nuxt db migrate` to apply the migration to the database, or run `npx nuxt dev` to apply the migration during development
- **Access the database**: Use the `db` instance from `@nuxthub/db` (or `hub:db` for backwards compatibility) to query the database, it is a Drizzle ORM instance.
  ** Querying**: Example nuxt api routes handler:

```ts
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  return await db.query.users.findMany();
  // or
  return await db.select().from(schema.users);
});
```

## Blob Storage

- **Enable Blob Storage**: Set `hub.blob` to `true` in `nuxt.config.ts` to enable blob storage support.
- **Blob Storage Usage**: Use the `blob` instance from `@nuxthub/blob` to interact with blob storage. This instance provides methods for uploading, retrieving, and managing blobs. Example usage in an API route handler:
- **File Upload Example**:

```ts
import { blob, ensureBlob } from "@nuxthub/blob";
export default defineEventHandler(async (event) => {
  const form = await readFormData(event)
  const file = form.get('file') as File

  if (!file || !file.size) {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  ensureBlob(file, {
    maxSize: '1MB',
    types: ['image'],
  })

  return blob.put(file.name, file, {
    addRandomSuffix: false,
    prefix: 'images',
  })
});

// returns
{
  pathname: string
  contentType: string | undefined
  size: number
  httpEtag: string | undefined
  uploadedAt: Date
  httpMetadata: Record<string, string>
  customMetadata: Record<string, string>
  url?: string
}

```

- **Upload with custom metadata**: You can also include custom metadata when uploading a blob, which can be useful for storing additional information about the file. Example:

```ts
blob.put(file.name, file, {
  customMetadata: {
    userId: "12345",
    description: "User uploaded document",
  },
});
```

- **Upload to a specific path**: Use the `prefix` option to specify a directory-like structure for storing blobs. Example:

```ts
blob.put("avatar.png", file, {
  prefix: `users/${userId}`,
});
```

- **Get blob metadata**: This example create an API route to get a blob's metadata by its pathname.

```ts
// server/api/files/[...pathname].get.ts
import { blob } from "@nuxthub/blob";

export default eventHandler(async (event) => {
  const { pathname } = getRouterParams(event);

  return blob.head(pathname);
});
```

- **Serve a blob**: This example create a server route on /images/[...pathname] to serve a blob by its pathname.

```ts
// server/routes/images/[...pathname].get.ts
import { blob } from "hub:blob";

export default eventHandler(async (event) => {
  const pathname = getRouterParam(event, "pathname");
  if (!pathname) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  return blob.serve(event, pathname);
});

// To display the image in your application, you can use the <img> tag with the pathname of the blob.
// <template>
//  <img src="/images/my-image.jpg">
// </template>
```

- **Delete a blob**: To delete a file, you can use the blob.del() method.

```ts
// server/api/files/[...pathname].delete.ts
import { blob } from "@nuxthub/blob";

export default eventHandler(async (event) => {
  const { pathname } = getRouterParams(event);

  await blob.del(pathname);

  return sendNoContent(event);
});
```

- **Simple upload with handleUpload()**: A server function to handle file uploads. It validates the files and uploads them to Blob Storage.

```ts
// await blob.handleUpload(event, options)
import { blob } from "hub:blob";

export default eventHandler(async (event) => {
  // Make sure to check if the user can upload files before calling this function
  return blob.handleUpload(event, {
    formKey: "files",
    multiple: true,
    ensure: {
      maxSize: "10MB",
      types: ["image/jpeg", "image/png", "image/webp"],
    },
    put: {
      addRandomSuffix: true,
      prefix: "images",
    },
  });
});
```

- **useUpload()**: A Vue composable to handle file uploads on the client.

``vue

<script setup lang="ts">
const upload = useUpload('/api/upload')

async function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const uploadedFiles = await upload(target)
  // Files uploaded successfully
  console.log('Uploaded:', uploadedFiles)
}
</script>

<template>
  <input
    accept="image/jpeg, image/png, image/webp"
    type="file"
    name="files"
    multiple
    @change="onFileSelect"
  >
</template>
```
