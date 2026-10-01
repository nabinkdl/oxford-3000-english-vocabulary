# Oxford 3000 English–Nepali Vocabulary

Interactive Oxford 3000 vocabulary learning app: A–Z word lists with English–Nepali meanings, audio pronunciation, flashcards, quiz mode, progress tracking, and analytics. Built with React + Vite + Tailwind + Supabase.

## Features

- **Table / Flashcards / Quiz / Analytics** views (`src/components/`)
- **A–Z + ALL letter navigation** with per-letter progress (`LetterNav.tsx`, `StatsBar.tsx`)
- **Search, status filter (learned/unlearned/starred), CEFR filter**
- **Check / star words**, bulk mark-all-learned, reset with confirm modal
- **Quiz stats + streaks** persisted to localStorage (`src/utils/storage.ts`)
- **Meaning language switcher** (`src/utils/meanings.ts`)
- **Audio pronunciation** (`src/utils/speech.ts`)
- **Supabase Auth** gate + password recovery (`AuthScreen.tsx`, `src/utils/supabase.ts`)
- **Support / donations modal** with network selector, QR (`qrcode.react`), copy address, explorer links
  - Supported: Solana, Tron, BNB Chain, Ethereum, Bitcoin
  - Config: `src/utils/donations.ts`, icons: `public/coins/*.svg`

## Tech stack

- React 19, Vite 8, TypeScript, Tailwind CSS v4
- Supabase (`@supabase/supabase-js`) – auth only
- `lucide-react`, `motion`, `qrcode.react`
- `@google/genai`, `express` present in `package.json` but not required for the vocab flow

## Project structure

```
src/
  App.tsx                 # auth gate, view routing, progress state
  main.tsx                # React entry
  index.css               # Tailwind + fonts
  data/oxford3000.ts      # ALL_WORDS, VOCAB_BY_LETTER, TOTAL_WORD_COUNT
  data/letters*.ts        # A–Z word data
  components/             # Header, LetterNav, FilterBar, VocabTable,
                          # FlashcardsView, QuizView, GameAnalyticsDashboard,
                          # AuthScreen, SupportModal, ResetConfirmModal, Toast
  utils/                  # supabase, storage, meanings, speech, donations
  types/vocab.ts
public/coins/             # btc, eth, bnb, sol, trx icons
```

## Run locally

Prerequisites: Node.js 20+

```bash
npm install
cp .env.example .env.local
npm run dev
```

App runs at `http://localhost:3000` (`package.json:7` sets `--port=3000`).

### Environment

Copy `.env.example` to `.env.local` and fill in:

| Var | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Only for AI Studio / Gemini calls | Server-side Gemini API |
| `APP_URL` | Only for hosted callbacks | Self-referential URL / OAuth callback |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/publishable key |

Auth will hang on “Loading your account...” if Supabase vars are missing/invalid.

### Scripts

```bash
npm run dev      # vite dev server
npm run build    # production build -> dist/
npm run preview  # preview dist build
npm run lint     # tsc --noEmit
npm run clean    # rm -rf dist server.js
```

## Supabase setup

1. Create a Supabase project.
2. Enable Email auth (password recovery flow is handled in `App.tsx` via `PASSWORD_RECOVERY` event).
3. Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local`.
4. Optional `todos` table (queried in `App.tsx` when session exists):
   ```sql
   create table todos (id bigint primary key generated always as identity, name text);
   ```
   If the table is missing, the app logs `Failed to load Supabase todos` and continues.

## Donations (Support modal)

Receiving addresses live in `src/utils/donations.ts` – edit them there. No private keys are used; these are public receive-only addresses.

Flow: Header `Support` button → `SupportModal.tsx` → select network → scan QR / copy address → verify on explorer.

To change/add a network, add an entry with `{ id, label, network, symbol, address, explorerUrl, note, icon }` and drop the icon SVG in `public/coins/`.

## Deploy

Static Vite output (`dist/`). Deploy to Vercel / Netlify / Cloud Run / any static host:

```bash
npm run build
```

Set the same `VITE_*` env vars in the host dashboard. No server component is required for the vocab app.

## AI Studio reference

Original template note: `https://ai.studio/apps/3c58ed89-a79f-41d4-b07c-290675caa6a0`. `GEMINI_API_KEY` / `APP_URL` injection only applies when running inside AI Studio.
