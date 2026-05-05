# Authentication

---

> **RULE — NON-NEGOTIABLE: ALL authentication MUST go through Clerk.**
>
> Do NOT implement custom auth, roll your own sessions, use NextAuth, or reach for any other auth library. Clerk is the sole authentication provider for this app. No exceptions.

---

## Clerk Only

This app uses [Clerk](https://clerk.com/) for all authentication and user identity. This means:

- **Allowed:** Clerk components, hooks, and helpers (`currentUser`, `auth`, `clerkMiddleware`, etc.)
- **Forbidden:** Custom session handling, JWT creation/validation, password hashing, or any DIY auth logic
- **Forbidden:** Any other auth library (NextAuth, Auth.js, Lucia, better-auth, etc.)
- **Forbidden:** Storing user passwords or session tokens in the database

## Reading the Current User

### In Server Components

Use `currentUser()` or `auth()` from `@clerk/nextjs/server`:

```ts
import { currentUser, auth } from '@clerk/nextjs/server'

// Full user object
export default async function Page() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  // use user.id, user.emailAddresses, etc.
}

// Auth object only (lighter — use when you only need the userId)
export default async function Page() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
}
```

### In Client Components

Use the `useUser` or `useAuth` hooks from `@clerk/nextjs`:

```tsx
'use client'
import { useUser } from '@clerk/nextjs'

export function ProfileButton() {
  const { user, isLoaded } = useUser()
  if (!isLoaded) return null
  return <span>{user?.firstName}</span>
}
```

## Route Protection

Protect routes via `clerkMiddleware` in `proxy.ts` (the Next.js 16 equivalent of `middleware.ts`):

```ts
// proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export const proxy = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})
```

Do NOT protect routes by checking `userId` inside individual page components — middleware is the single enforcement point.

## Sign-In / Sign-Up Pages

Use Clerk's hosted components. Mount them at the conventional paths:

- `/sign-in` → `<SignIn />`
- `/sign-up` → `<SignUp />`

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return <SignIn />
}
```

Do not build custom sign-in or sign-up forms.

## User ID in the Database

When writing data that belongs to a user, use the Clerk `userId` (a string like `user_2abc…`) as the foreign key — do NOT create a separate `users` table that mirrors Clerk's user records.

```ts
// data/workouts.ts  ✅ correct
export async function createWorkout(userId: string, data: NewWorkout) {
  return db.insert(workouts).values({ ...data, userId })
}
```

```ts
// ❌ wrong — syncing a users table
export async function syncUser(clerkUser: User) {
  return db.insert(users).values({ id: clerkUser.id, email: … })  // unnecessary
}
```

## Environment Variables

Clerk requires these environment variables — never hard-code them:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_…
CLERK_SECRET_KEY=sk_…
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## Summary Checklist

| Question | Answer |
|---|---|
| What auth provider do I use? | Clerk — no other |
| How do I get the current user in a Server Component? | `await currentUser()` or `await auth()` from `@clerk/nextjs/server` |
| How do I get the current user in a Client Component? | `useUser()` or `useAuth()` from `@clerk/nextjs` |
| Where do I enforce route protection? | `proxy.ts` via `clerkMiddleware` |
| Can I build a custom sign-in form? | No — use `<SignIn />` |
| Do I store users in my database? | No — use Clerk's `userId` as a foreign key only |
