# StatCourt

[![CI](https://github.com/jaredmamaril/statcourt/actions/workflows/ci.yml/badge.svg)](https://github.com/jaredmamaril/statcourt/actions/workflows/ci.yml)

StatCourt is a full-stack basketball analytics platform for exploring NBA player data, comparing players, building custom lineups, and generating dynamic scouting reports.

**Live App:** [https://statcourt.app](https://statcourt.app)

![StatCourt Preview](./public/readme/statcourt-preview.png)

Built with Next.js, TypeScript, Supabase, PostgreSQL, and Redis, StatCourt combines current and historical NBA data with custom player-rating, lineup-fit, archetype, and scouting models. The platform includes authentication, public profiles, community features, saved lineups, player comparisons, and production-focused security controls.

## Highlights

- Custom multi-era NBA player analytics across Career, Peak, and Current profiles
- Position-aware lineup builder with keyboard-accessible drag-and-drop
- Dynamic scouting reports with lineup archetypes, strengths, weaknesses, and player fits
- Full account and community system with public profiles, saved lineups, favorites, follows, reports, and security controls

## Features

- Browse, search, and filter current and historical NBA players
- View full player profiles with ratings, traits, similar players, and lineup fits
- Compare two players across Career, Peak, and Current stat profiles
- Explore rankings by overall, scoring, shooting, playmaking, rebounding, defense, efficiency, and archetypes
- Build custom lineups with position-fit logic and drag-and-drop drafting
- Generate lineup scouting reports with archetypes, strengths, weaknesses, grades, X-Factors, and similar lineup matches
- Save, rename, load, scout, and delete lineups
- Favorite players and track recent activity
- Create public profiles with public lineups, favorite players, and basketball identity
- Follow and report public profiles
- Use fallback player data when Supabase player loading is disabled or unavailable

## Tech Stack

### App

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React

### Backend

- Next.js Route Handlers
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Upstash Redis
- Row Level Security

### Deployment

- Vercel
- Supabase
- Resend

## Architecture

StatCourt uses a Next.js frontend and API layer backed by Supabase PostgreSQL.

- Supabase Auth manages email/password and Google authentication.
- Row Level Security protects user-owned database records.
- Next.js route handlers handle authenticated mutations and server-side validation.
- Upstash Redis provides distributed API rate limiting.
- Supabase Storage stores user avatars.
- Security events are persisted server-side for sensitive account and abuse activity.
- Vercel hosts the Next.js application.

### Optional Data Scripts

- Python
- nba_api
- pandas
- requests

## Project Structure

```text
statcourt/
├── app/
│   ├── api/                 # Next.js route handlers
│   ├── auth/                # Auth callback flow
│   ├── community/           # Community profile discovery
│   ├── components/          # UI, basketball logic, auth, lineups, players
│   ├── court/               # Player comparison court
│   ├── lib/                 # Auth, Supabase, rate limit, security utilities
│   ├── lineups/             # Featured, builder, and saved lineup page
│   ├── players/             # Player list and profile routes
│   ├── profile/             # Private account profile hub
│   ├── rankings/            # Player rankings and archetype rankings
│   ├── settings/            # Account, security, privacy, and preferences
│   └── u/[username]/        # Public profile pages
├── public/                  # Static assets, icons, videos, backgrounds
├── scripts/                 # SQL and optional player data scripts
├── next.config.ts
├── package.json
└── README.md
```

## Getting Started

### Requirements

- Node.js
- npm
- Git
- Supabase project
- Upstash Redis database for rate limiting

Optional, only for running player data scripts:

- Python 3
- nba_api
- pandas
- requests

### Install

```bash
git clone https://github.com/jaredmamaril/statcourt.git
cd statcourt
npm install
```

### Environment Variables

Create `.env.local` in the project root.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_USE_SUPABASE_PLAYERS=true

SUPABASE_SERVICE_ROLE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SECURITY_EVENT_SALT=
```

Notes:

- `NEXT_PUBLIC_*` values are exposed to the browser.
- `SUPABASE_SERVICE_ROLE_KEY`, Redis credentials, and `SECURITY_EVENT_SALT` must stay server-only.
- Do not commit `.env.local` or private credentials.
- Keep `.env.example` updated when deployment-required variables change.

### Development

```bash
npm run dev
```

Open `http://localhost:3000`.

### Validation

```bash
npx tsc --noEmit
npm run lint
npm run build
```

The production build may need network access because `next/font` fetches Google Fonts during build.

## Deployment

StatCourt is deployed on Vercel at [statcourt.app](https://statcourt.app).

Before deploying:

1. Connect the GitHub repo to Vercel.
2. Add all required environment variables in Vercel.
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
4. Configure Supabase Auth redirect URLs for the production domain.
5. Configure Google OAuth redirect URLs.
6. Configure custom SMTP in Supabase Auth, preferably with Resend.
7. Verify Supabase RLS policies are active.
8. Verify the `avatars` storage bucket policies and file limits.
9. Run `npm run build`.

Recommended production auth URLs:

```text
https://statcourt.app/auth/callback
https://statcourt.app/reset-password
```

Keep localhost redirect URLs available for development if needed.

## Supabase

StatCourt uses Supabase for authentication, PostgreSQL data storage, public/private user profiles, saved user content, moderation/reporting data, player analytics data, and avatar storage.

## Authentication

Supported auth flows:

- Email/password sign up and sign in
- Password reset
- Password setup for OAuth users
- Email change flow
- Google OAuth
- Account deletion

Production authentication emails are delivered through Resend using a verified custom sending domain.

## Security

StatCourt includes:

- Supabase Row Level Security for user-owned data
- Server-side authorization and ownership validation
- Redis-backed API rate limiting
- Input validation and sanitization
- Origin checks for mutation routes
- IDOR protection on user-owned resources
- Content Security Policy and browser security headers
- Safe error handling
- Persistent server-side security-event logging
- Server-only handling of service-role keys and other secrets

Never expose or commit:

- Supabase service-role keys
- Redis tokens
- database passwords
- OAuth secrets
- SMTP credentials
- security salts
- access tokens or refresh tokens

## Optional Player Data Scripts

The `scripts/` directory contains optional Python and SQL utilities for player data imports, stat profile generation, backfills, RLS setup, and security-event setup.

These scripts are not required to run the web app if the database is already populated or fallback data is used.

Before running a script:

1. Read the script.
2. Confirm required environment variables.
3. Confirm whether it writes to Supabase.
4. Run it against the intended database only.

Example Python setup:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install nba_api pandas requests python-dotenv
```

Run a script from the project root:

```bash
python scripts/<script-name>.py
```

## Fallback Data

StatCourt can use local fallback player data when Supabase player loading is disabled or unavailable.

```env
NEXT_PUBLIC_USE_SUPABASE_PLAYERS=true
```

When this is not set to `true`, the app uses local fallback data for core player experiences.

## Legal and Transparency Pages

The app includes user-facing pages for:

- Privacy
- Terms
- Contact
- Data Sources
- Photo Credits

These pages explain account data, public profile visibility, analytics sources, model interpretation, image credits, and how users can contact or report issues.

## Author

**Matt Jared Mamaril**  
Computer Science student at the University of Illinois Chicago

- [LinkedIn](https://linkedin.com/in/mattjaredmamaril)
- [GitHub](https://github.com/jaredmamaril)

## Disclaimer

StatCourt is an independent basketball analytics project.

It is not affiliated with, endorsed by, or sponsored by the NBA, its teams, or its players.

Basketball data, team names, logos, player imagery, trademarks, and other third-party assets belong to their respective owners.
