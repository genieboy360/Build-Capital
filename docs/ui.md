# UI Coding Standards

## Component Library — shadcn/ui Only

**All UI components must come from [shadcn/ui](https://ui.shadcn.com/).** No custom components are to be created under any circumstances.

- Install components via the shadcn CLI: `npx shadcn@latest add <component>`
- Installed components land in `src/components/ui/` — do not modify them beyond what shadcn generates
- Do not create new files in `src/components/ui/` by hand
- Do not build wrapper components, compound components, or abstractions on top of shadcn primitives — use them directly at the call site
- If a shadcn component does not exist for a use case, find the closest available shadcn component and adapt the layout/content to fit it

## Date Formatting — date-fns

All date formatting must use [date-fns](https://date-fns.org/). No other date library (dayjs, moment, Intl.DateTimeFormat, etc.) may be used for display formatting.

### Required Format

Dates shown to users must follow this pattern:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

This is: ordinal day + abbreviated month + full year.

### Implementation

Use `format` with `do MMM yyyy` from date-fns:

```ts
import { format } from 'date-fns'

format(new Date('2025-09-01'), 'do MMM yyyy') // "1st Sep 2025"
format(new Date('2025-08-02'), 'do MMM yyyy') // "2nd Aug 2025"
format(new Date('2026-01-03'), 'do MMM yyyy') // "3rd Jan 2026"
format(new Date('2024-06-04'), 'do MMM yyyy') // "4th Jun 2024"
```

No other date display format is permitted unless explicitly approved for a specific technical context (e.g. `datetime-local` input values).
