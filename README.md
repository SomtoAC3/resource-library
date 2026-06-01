# Resource Library

A search-first library for discovering and collecting the internet's best resources — AI tools, inspiration, component libraries, and more.

**Production:** https://resource-library-nu.vercel.app

## Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL + Full-Text Search)
- **AI:** OpenAI gpt-4o-mini
- **Screenshots:** ScreenshotOne
- **Deployment:** Vercel

## Getting Started

Copy the example env file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_ANON_KEY=
OPENAI_API_KEY=
SCREENSHOT_API_KEY=        # optional — falls back to OG image
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

Run the migration in your Supabase SQL editor:

```
supabase/migrations/001_initial.sql
```
