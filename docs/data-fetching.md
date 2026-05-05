# Data Fetching

---

> **RULE — NON-NEGOTIABLE: ALL data fetching MUST happen in Server Components.**
>
> Do NOT fetch data in route handlers, client components, `useEffect`, SWR, React Query, or any other mechanism. The only permitted data-fetching site is a React Server Component. No exceptions.

---

## Server Components Only

Every piece of data this app needs must be fetched inside a Server Component (`async function` with no `'use client'` directive). This means:

- **Allowed:** `async` Server Components that `await` helper functions from `/data`
- **Forbidden:** `fetch()` or DB calls inside Route Handlers (`app/api/…/route.ts`)
- **Forbidden:** `fetch()`, `useEffect`, SWR, React Query, or any data-fetching hook inside Client Components
- **Forbidden:** raw `fetch()` calls anywhere in the codebase — go through `/data` helpers instead

If a component needs data and it is a Client Component, lift the data fetch into the nearest Server Component ancestor and pass the result down as a prop.

## Database Queries via /data Helpers

All database queries MUST go through helper functions located in the `/data` directory.

### Rules

1. **Every query lives in `/data`.** No DB access outside of this directory.
2. **Use Drizzle ORM exclusively.** Do NOT write raw SQL strings. No `db.execute('SELECT …')`, no template-literal SQL, no `sql\`…\`` tagged templates used as a substitute for the ORM query builder.
3. **One concern per file.** Group helpers by domain (e.g. `data/workouts.ts`, `data/exercises.ts`).
4. **Helper functions are plain async functions** — no class wrappers, no repositories pattern, just exported `async function` exports.

### Example

```ts
// data/workouts.ts  ✅ correct
import { db } from '@/lib/db'
import { workouts } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function getWorkoutById(id: string) {
  return db.query.workouts.findFirst({ where: eq(workouts.id, id) })
}
```

```ts
// ❌ wrong — raw SQL
export async function getWorkoutById(id: string) {
  return db.execute(`SELECT * FROM workouts WHERE id = '${id}'`)
}
```

```ts
// ❌ wrong — query inside a route handler
// app/api/workouts/route.ts
export async function GET() {
  const data = await db.query.workouts.findMany()   // move this to /data
  return Response.json(data)
}
```

```ts
// ❌ wrong — query inside a client component
'use client'
export function WorkoutList() {
  const [data, setData] = useState([])
  useEffect(() => { fetch('/api/workouts').then(…) }, [])  // forbidden
}
```

## Summary Checklist

| Question | Answer |
|---|---|
| Where do I fetch data? | Server Component only |
| Where do I write DB queries? | `/data` helpers only |
| What ORM do I use? | Drizzle ORM — no raw SQL |
| Can I use route handlers to serve data? | No |
| Can I fetch in a Client Component? | No |
