# StatCourt

StatCourt is a full-stack NBA analytics platform that allows users to explore player data, compare current and historical players, build custom lineups, and generate data-driven scouting reports.

The application combines a basketball-themed interface with a PostgreSQL database hosted on Supabase. It also includes optional Python scripts that developers can use to retrieve, process, and prepare NBA player statistics using the `nba_api` library.

## Features

* Browse current and historical NBA players
* Search and filter the player database
* View player profiles and career statistics
* Compare two players side by side
* Switch between supported statistical profiles
* Visualize player strengths with radar charts
* Review category-by-category comparison advantages
* Generate player matchup summaries
* Build custom starting lineups
* Generate data-driven lineup scouting reports
* Save player selections and user preferences
* Use fallback player data when Supabase is unavailable
* Access responsive layouts across desktop and mobile devices

## Player Comparison

StatCourt includes an interactive comparison court where users can select two players and analyze their performance.

Comparison features include:

* Career and alternate statistical profiles
* Scoring, rebounding, playmaking, shooting, and defensive analysis
* Interactive radar-chart visualizations
* Searchable player-selection menus
* Category comparison results
* Matchup summaries
* Saved comparison selections
* Loading and database error states

## Data Architecture

StatCourt uses a PostgreSQL database hosted on Supabase to store player information and statistical profiles.

Stored player data includes:

* NBA player IDs
* Player names
* Teams and positions
* Jersey numbers
* Height and weight
* Career games played
* Points, rebounds, and assists per game
* Steals and blocks per game
* Field-goal percentage
* Three-point percentage
* Free-throw percentage
* Career and playoff statistical profiles
* Defensive ratings
* Star-power ratings
* Career-legacy ratings
* Player images and metadata

The application retrieves player data through a Next.js API route and maps database records into TypeScript objects used throughout the interface.

If Supabase is disabled or unavailable, StatCourt can fall back to a local player dataset so the core application remains usable.

## Technology Stack

### Front End

* Next.js
* React
* TypeScript
* Tailwind CSS
* Recharts
* Lucide React
* `dnd-kit`

### Backend and Database

* Next.js Route Handlers
* Supabase
* PostgreSQL
* Supabase JavaScript Client

### Optional Data Processing

* Python
* `nba_api`

### Development Tools

* Git
* GitHub
* Visual Studio Code
* ESLint

## Project Structure

```text
statcourt/
├── app/
│   ├── api/                  # Next.js API routes
│   ├── components/           # React components, player logic, and shared types
│   ├── court/                # Player comparison experience
│   ├── lib/                  # Authentication, settings, and utilities
│   └── page.tsx              # Landing page
├── public/                   # Images, videos, icons, and static assets
├── scripts/                  # Optional Python data-ingestion scripts
├── package.json
└── README.md
```

The project structure may change as development continues.

## Getting Started

### Requirements

To run the StatCourt web application:

* Node.js
* npm
* Git

Optional requirements for retrieving player statistics yourself:

* Python 3
* A Supabase or PostgreSQL database
* Access to the NBA statistics endpoints

Python is not required when you only want to run the web application using the existing player data.

### Clone the Repository

```bash
git clone https://github.com/jaredmamaril/statcourt.git
cd statcourt
```

### Install JavaScript Dependencies

```bash
npm install
```

This installs all dependencies listed in `package.json`, including Next.js, React, Supabase, Recharts, Tailwind CSS, drag-and-drop tools, TypeScript, and ESLint.

### Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_USE_SUPABASE_PLAYERS=true
```

Do not commit `.env.local`, database passwords, service-role keys, or other private credentials.

The Supabase anonymous key may be used by the client application, but database access should still be protected with properly configured Row Level Security policies.

### Run the Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Create a Production Build

```bash
npm run build
npm run start
```

### Run ESLint

```bash
npm run lint
```

## Optional Player Data Scripts

The Python scripts in the `scripts/` directory are optional.

They are intended for developers who want to retrieve, process, and prepare NBA player statistics themselves instead of relying only on the existing player data.

These scripts may be used to:

* Retrieve current and historical NBA player information
* Collect career and playoff statistics
* Calculate per-game averages
* Clean incomplete or inconsistent API responses
* Generate SQL or import-ready player records
* Populate a separate PostgreSQL or Supabase database
* Track skipped players and failed API requests
* Retry requests when NBA endpoints disconnect or time out

### Python Setup

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Activate it on macOS or Linux:

```bash
source .venv/bin/activate
```

Install the packages required by the selected script:

```bash
pip install nba_api pandas requests python-dotenv
```

Some scripts may require additional packages depending on whether they generate SQL files or connect directly to a database.

Review the imports and configuration at the top of the selected script before running it.

### Run a Data Script

Run a script from the project root:

```bash
python scripts/<script-name>.py
```

Replace `<script-name>.py` with the script you want to run.

Some scripts may output SQL files, error logs, skipped-player lists, or import-ready records instead of writing directly to the database.

NBA statistics endpoints may occasionally reject requests, disconnect, or time out. Some scripts include retry logic, delays, fallback handling, or skipped-player reporting to manage these issues.

## Database Configuration

StatCourt currently uses database tables including:

* `players`
* `player_stat_profiles`

The `players` table stores primary player information and career-level values.

The `player_stat_profiles` table stores additional statistical profiles, including career and playoff performance associated with each player.

The database schema and import process may change as development continues.

## Fallback Data

StatCourt can use local fallback player data when Supabase is disabled or unavailable.

The application checks the following environment variable:

```env
NEXT_PUBLIC_USE_SUPABASE_PLAYERS=true
```

When this value is not set to `true`, the application uses its local player dataset.

If Supabase is enabled but a database request fails, the application can also return fallback data so the main player experience remains available.

## Screenshots

Screenshots will be added as the main interfaces are finalized.

Recommended screenshots include:

* Landing page
* Player database
* Player profile
* Player comparison court
* Lineup builder
* Generated scouting report

Example:

```markdown
![StatCourt player comparison](docs/player-comparison.png)
```

## Current Development Priorities

* Expand current and historical player coverage
* Improve statistical data validation
* Refine player ratings and lineup calculations
* Improve scouting-report explanations
* Strengthen authentication and account-based persistence
* Optimize Supabase queries and loading performance
* Add automated tests
* Improve accessibility
* Deploy a public production version

## Security

Sensitive credentials must not be committed to the repository.

Keep the following values in local or deployment environment variables:

* Supabase service-role keys
* Database passwords
* Private API credentials
* Administrative tokens

Do not commit:

* `.env`
* `.env.local`
* Generated credential files
* Private database URLs
* Supabase service-role keys
* Import logs containing sensitive data

Public Supabase access should be protected with Row Level Security policies and limited database permissions.

## Project Status

StatCourt is under active development.

Features, statistical formulas, database structures, player ratings, and interface designs may change as the project continues to grow.

## Author

**Matt Jared Mamaril**
Computer Science student at the University of Illinois Chicago

* [LinkedIn](https://linkedin.com/in/mattjaredmamaril)
* [GitHub](https://github.com/jaredmamaril)

## Disclaimer

StatCourt is an independent educational and portfolio project.

It is not affiliated with, endorsed by, or sponsored by the National Basketball Association or any NBA team.

NBA names, team names, statistics, logos, and related materials belong to their respective owners.
