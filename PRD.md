# Resource Library PRD (v1)

## Product Name

Working Title: Resource Library

---

# Vision

A search-first library for discovering and rediscovering useful internet resources.

Users submit a URL and the platform automatically extracts metadata, generates categories and tags, captures screenshots, and makes the resource searchable.

The product should feel like a blend of:

* Are.na
* Pinterest
* GitHub
* Linear

The emphasis is on search, discovery, and curation.

---

# Target Users

Primary:

* Designers
* Developers
* AI enthusiasts
* Creators

Initial Use Case:

* Personal collection

Future Use Case:

* Public community-driven directory

---

# Core Principles

## Principle 1: URL Only

Adding a resource should require only a URL.

No forms.

No manual categorization.

No mandatory descriptions.

Flow:

Paste URL
→ Submit
→ Resource appears

---

## Principle 2: Search First

Search is the primary feature.

The homepage should immediately communicate:

"Search thousands of useful resources."

The search bar should dominate the interface.

---

## Principle 3: Visual Discovery

Resources should be browsable visually.

Users should be able to switch between:

* Gallery View
* List View

Gallery should be the default.

---

## Principle 4: AI Works Quietly

Users should never have to categorize resources manually.

AI should automatically generate:

* Categories
* Tags
* Summaries

---

# MVP Features

## Homepage

Sections:

1. Hero Search
2. Categories
3. Featured Resources
4. Recent Resources

Hero Search occupies the most visual space.

---

## Submit Resource

Single field:

URL

Submit button:

Add Resource

---

## Search

Search by:

* Website Name
* Description
* Tags
* Categories
* Domain

Features:

* Instant search
* Gallery/List toggle
* Category filters

---

## Resource Page

Displays:

* Screenshot
* Title
* Description
* Tags
* Categories
* Domain
* Visit Website button

---

# Categories

Initial Categories:

* AI Tools
* Inspiration
* Components
* Interactions

AI may assign multiple categories.

---

# Metadata Extraction

When a URL is submitted:

Extract:

* Page Title
* Description
* OpenGraph Image
* Favicon
* Domain

Store automatically.

---

# AI Processing

Generate:

## Categories

Example:

Framer Motion
→ Components
→ Interactions

---

## Tags

Examples:

React
Animation
UI
Design
Motion
AI
Productivity

---

## Summary

Create a concise summary under 200 characters.

Example:

"A modern React animation library for creating fluid UI interactions."

---

# Search Ranking

Prioritize:

1. Title
2. Tags
3. Categories
4. Description
5. Domain

---

# Future Features

Not included in MVP.

## V2

* Related Resources
* Collections
* User Accounts
* Saved Resources
* Resource Health Monitoring

## V3

* Semantic Search
* Browser Extension
* Mobile Share Extension
* Public API
* Community Profiles

---

# Technical Stack

Frontend:

* Next.js 16
* TypeScript
* Tailwind CSS
* shadcn/ui

Backend:

* Supabase

Database:

* PostgreSQL

Search:

* PostgreSQL Full Text Search

AI:

* OpenAI

Deployment:

* Vercel

---

# Success Metric

A user should be able to:

1. Paste a URL.
2. Find it again months later within seconds.

If that works, the MVP succeeds.
