# StatCourt Agent Guide

## Project

StatCourt is a full-stack NBA analytics platform built with:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Upstash Redis
- Vercel

## Commands

```bash
npm run dev
npx tsc --noEmit
npm run lint
npm run build
```

## UI Conventions

- Use mobile-first styling.
- Default Tailwind classes target mobile.
- Use `lg:` for desktop-specific sizing and layout.
- Preserve the existing StatCourt dark basketball analytics design.
- Do not use `backdrop-blur-*`.
- Do not redesign unrelated UI during focused changes.
- Respect the existing reduced-motion system.

## Security

Do not weaken existing security controls.

Existing protections include:

- Supabase Row Level Security
- authenticated ownership checks
- IDOR protection
- shared input validation
- request Origin validation on mutation routes
- Redis-backed rate limiting
- CSP and browser security headers
- persistent security-event logging
- server-only service-role access

Never:

- expose `SUPABASE_SERVICE_ROLE_KEY`
- expose Redis tokens
- expose `SECURITY_EVENT_SALT`
- expose access or refresh tokens
- return raw Supabase/database/provider errors to users
- trust client-supplied `user_id` or ownership fields
- use service-role writes without explicit authorization and ownership checks

## Supabase

- Public basketball data is read-only.
- User-owned records must be scoped to the authenticated user.
- `public_profiles` is the public-safe profile surface.
- `user_profiles` is private and owner-only.
- `security_events` is server-only.
- Avatar writes must remain restricted to the authenticated user's storage folder.
- Do not assume live database constraints from application code alone.
- Inspect existing SQL or the live Supabase schema before proposing migrations.

## API Conventions

- Reuse existing authentication/request-context helpers.
- Use the shared input-validation utilities for user input.
- Preserve rate limiting.
- Preserve Origin validation on mutation routes.
- Return safe generic server errors.
- Do not spread arbitrary client objects into database writes.
- Service-role routes must explicitly enforce ownership.

## Accessibility

Preserve the existing accessibility work, including:

- accessible dialogs and focus trapping
- real form labels and error associations
- ARIA tabs and segmented controls
- keyboard-accessible lineup drag-and-drop
- accessible tooltips and popovers
- visible `focus-visible` states
- live status announcements
- reduced-motion support
- accessible touch targets and contrast

## Basketball Logic

Do not change established basketball/scouting logic unless explicitly requested.

Preserve:

- Career / Peak / Current stat-profile behavior
- position-fit logic
- natural / flex / reach / mismatch behavior
- lineup scoring
- scout-report calculations
- official StatCourt archetype names

## Development Rules

- Make focused changes.
- Do not change unrelated business logic.
- Reuse existing helpers/components before creating duplicates.
- Preserve public/private profile behavior.
- Avoid broad refactors unless requested.
- Do not invent database fields, routes, or configuration that are not present in the repo.

## After Changes

Always run:

```bash
npx tsc --noEmit
npm run lint
```

Run:

```bash
npm run build
```

for deployment-related, dependency, configuration, or larger architectural changes.

When finished, report:

- files changed
- what changed
- important implementation decisions
- checks passed
