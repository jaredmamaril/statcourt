## Future Auth Work

- Add true account linking in Settings.
- Use Supabase `linkIdentity()` for Google/provider connection instead of normal OAuth sign-in.
- Let one StatCourt account connect multiple sign-in methods:
  - Email/password
  - Google
  - Future providers like Discord or GitHub
- Show connected methods with connect/disconnect controls.
- Keep saved lineups, favorites, settings, and activity tied to the same `auth.users.id`.
