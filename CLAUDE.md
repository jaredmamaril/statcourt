# Claude Instructions

Before making changes in this repository, read and follow [`AGENTS.md`](./AGENTS.md).

`AGENTS.md` is the canonical source for StatCourt development rules, including:

- project architecture
- UI conventions
- security requirements
- Supabase and API rules
- accessibility requirements
- basketball/scouting logic
- validation commands
- reporting expectations after changes

## Claude-Specific Guidance

- Make focused changes only.
- Do not modify unrelated files or business logic unless explicitly requested.
- Reuse existing helpers and components before creating new abstractions.
- Inspect the current implementation before proposing architectural changes.
- Do not assume database schema, constraints, or production configuration from application code alone.
- Preserve existing security, authentication, accessibility, and reduced-motion behavior.

## Verification

After normal code changes, run:

```bash
npx tsc --noEmit
npm run lint
```

For deployment-related, dependency, configuration, or larger architectural changes, also run:

```bash
npm run build
```

When finished, report:

- files changed
- what changed
- important implementation decisions
- checks passed
