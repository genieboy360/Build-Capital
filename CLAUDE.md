# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Turbopack, outputs to .next/dev)
npm run build    # Production build (Turbopack by default)
npm run start    # Start production server
npm run lint     # Run ESLint directly (next lint no longer exists)
```

## Stack

- **Next.js 16.2** with App Router (`src/app/`)
- **React 19.2** — Server Components by default; add `'use client'` only for interactivity
- **TypeScript 5**, **Tailwind CSS v4**, ESLint v9 flat config (`eslint.config.mjs`)
- Import alias: `@/*` → `src/*`

## Next.js 16 Breaking Changes

These differ significantly from Next.js 13–15 knowledge:

**Async Request APIs** — `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are async-only. Always `await` them:
```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```
Run `npx next typegen` to generate `PageProps`, `LayoutProps`, `RouteContext` helpers.

**`middleware` → `proxy`** — Rename `middleware.ts` to `proxy.ts`; rename the exported function to `proxy`. Edge runtime is not supported in `proxy`.

**`next lint` removed** — Use `eslint` directly (already in `package.json` scripts). `next build` no longer runs linting.

**Turbopack is default** — No flags needed. Use `--webpack` to opt out. Custom `webpack` config in `next.config.ts` will break builds unless `--webpack` flag is used.

**Turbopack config** — Moved from `experimental.turbopack` to top-level `turbopack` in `next.config.ts`.

**`revalidateTag` requires second arg** — `revalidateTag('posts', 'max')`. Use `updateTag` for immediate cache expiry in Server Actions.

**`cacheLife` / `cacheTag`** — No longer prefixed with `unstable_`. Import directly from `next/cache`.

**`cacheComponents`** — Replaces `experimental.dynamicIO` and the old PPR `experimental.ppr` flag.

**Parallel routes** — All `@slot` directories require an explicit `default.js`; builds fail without one.

**`serverRuntimeConfig` / `publicRuntimeConfig` removed** — Use `process.env` / `NEXT_PUBLIC_` env vars. Use `connection()` from `next/server` to read env vars at request time.

**`next/image` defaults changed** — `minimumCacheTTL` is 4 hours (was 60s), `qualities` defaults to `[75]`, `imageSizes` no longer includes `16`. Use `images.remotePatterns` (not deprecated `images.domains`). Local images with query strings require `images.localPatterns.search` config.

**Scroll behavior** — Next.js 16 no longer overrides `scroll-behavior: smooth` during navigation. Add `data-scroll-behavior="smooth"` to `<html>` to restore prior behavior.

**AMP removed** — All AMP APIs (`useAmp`, `config.amp`) are gone.

**Concurrent dev/build** — `next dev` outputs to `.next/dev`; `next build` outputs to `.next`. They can run concurrently.
