# Data Mutations

---

> **RULE — NON-NEGOTIABLE: ALL data mutations MUST go through `/data` helpers called from Server Actions defined in colocated `actions.ts` files.**
>
> Do NOT mutate data in route handlers, Client Components, or anywhere outside of this pattern. No exceptions.

---

## The Two-Layer Pattern

Every mutation follows the same two-layer structure:

1. **`/data` helper** — a plain async function that wraps a Drizzle ORM call. No business logic, no validation.
2. **Server Action in `actions.ts`** — validates input with Zod, calls the `/data` helper, handles errors.

Neither layer is optional. Do not skip the `/data` helper and call `db` directly inside a Server Action.

## `/data` Helpers

All database mutation logic lives in the `/data` directory, grouped by domain.

### Rules

- One file per domain (e.g. `data/workouts.ts`, `data/exercises.ts`)
- Plain exported `async function`s — no classes, no repositories pattern
- Use Drizzle ORM exclusively — no raw SQL, no `db.execute()`, no `` sql`…` `` template literals as a substitute for the query builder
- No Zod validation here — that belongs in the Server Action
- No auth checks here — pass `userId` in as a parameter

```ts
// data/workouts.ts  ✅ correct
import { db } from '@/lib/db'
import { workouts } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function insertWorkout(userId: string, data: typeof workouts.$inferInsert) {
  return db.insert(workouts).values({ ...data, userId })
}

export async function updateWorkout(id: string, userId: string, data: Partial<typeof workouts.$inferInsert>) {
  return db.update(workouts).set(data).where(eq(workouts.id, id))
}

export async function deleteWorkout(id: string, userId: string) {
  return db.delete(workouts).where(eq(workouts.id, id))
}
```

```ts
// ❌ wrong — raw SQL
export async function insertWorkout(userId: string, name: string) {
  return db.execute(`INSERT INTO workouts (user_id, name) VALUES ('${userId}', '${name}')`)
}
```

```ts
// ❌ wrong — validation inside a /data helper
export async function insertWorkout(userId: string, data: unknown) {
  const parsed = workoutSchema.parse(data)  // move this to the Server Action
  return db.insert(workouts).values({ ...parsed, userId })
}
```

## Server Actions

All mutations are triggered via Server Actions. Each Server Action must live in a colocated `actions.ts` file next to the route or component that uses it.

### Rules

- File must be named `actions.ts` and colocated with the feature it serves (e.g. `app/workouts/actions.ts`)
- Every file must start with `'use server'`
- Every parameter must be explicitly typed — **never use `FormData` as a parameter type**
- Every action must validate all arguments with a Zod schema before doing anything else
- Call `/data` helpers for all DB writes — never import `db` directly in an `actions.ts` file
- Read the current user via `auth()` from `@clerk/nextjs/server` — never trust a `userId` passed from the client

### Example

```ts
// app/workouts/actions.ts  ✅ correct
'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { insertWorkout, deleteWorkout } from '@/data/workouts'

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().date(),
  notes: z.string().max(500).optional(),
})

export async function createWorkout(params: z.infer<typeof createWorkoutSchema>) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const parsed = createWorkoutSchema.parse(params)
  await insertWorkout(userId, parsed)
}

const deleteWorkoutSchema = z.object({
  id: z.string().uuid(),
})

export async function removeWorkout(params: z.infer<typeof deleteWorkoutSchema>) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const { id } = deleteWorkoutSchema.parse(params)
  await deleteWorkout(id, userId)
}
```

```ts
// ❌ wrong — FormData param
export async function createWorkout(formData: FormData) { … }
```

```ts
// ❌ wrong — no Zod validation
export async function createWorkout(params: { name: string; date: string }) {
  const { userId } = await auth()
  await insertWorkout(userId!, params)  // params is unvalidated
}
```

```ts
// ❌ wrong — db called directly in actions.ts
import { db } from '@/lib/db'

export async function createWorkout(params: z.infer<typeof createWorkoutSchema>) {
  const parsed = createWorkoutSchema.parse(params)
  await db.insert(workouts).values(parsed)  // go through /data instead
}
```

```ts
// ❌ wrong — userId trusted from client
export async function createWorkout(params: z.infer<typeof createWorkoutSchema> & { userId: string }) {
  await insertWorkout(params.userId, params)  // never trust userId from the caller
}
```

## Summary Checklist

| Question | Answer |
|---|---|
| Where do DB mutation calls go? | `/data` helpers only |
| What ORM do I use? | Drizzle ORM — no raw SQL |
| Where do Server Actions live? | Colocated `actions.ts` next to the feature |
| Can Server Action params use `FormData`? | No — use explicit typed params |
| Do I validate params in Server Actions? | Yes — always with Zod, before anything else |
| How do I get the current user in a Server Action? | `await auth()` from `@clerk/nextjs/server` — never from params |
| Can I call `db` directly in `actions.ts`? | No — go through `/data` helpers |
