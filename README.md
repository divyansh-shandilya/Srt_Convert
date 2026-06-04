# SRTConvert

Convert your audio and video into subtitles. Fast, accurate, and supports basically every subtitle format you can think of.

Upload an MP3 or MP4, pick a language, and get back subtitles. Seriously, that's it.

---

## Features

- **Transcription** — Powered by Groq's Whisper large-v3 (or Google Gemini for huge files)
- **20 languages** — English, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Russian, Japanese, Korean, Chinese, Arabic, Turkish, Hindi, Vietnamese, Thai, Indonesian, Greek, Hebrew
- **Subtitle formats** — SRT, WebVTT, Scenarist SCC, Spruce STL, ASS, TTML, QT Text, Netflix DFXP, SAMI, MicroDVD, SubViewer 2.0, YouTube SBV, LRC
- **Document exports** — Plain text, CSV, Word, PDF, Excel (if you just need the transcription)
- **Built for developers** — Self-hostable, clear codebase, no locked APIs

---

## What's under the hood

- **Frontend** — React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend** — Node.js + Express (with Vite dev middleware)
- **Transcription** — Groq Whisper large-v3 (≤25 MB) + Google Gemini (>25 MB)
- **Auth** — Google OAuth 2.0
- **Payments** — PayPal Subscriptions
- **Database** — SQLite locally + Supabase for cloud sync
- **Max file size** — 100 MB (enforced by Multer)

---

## Quick start

**Need:** Node.js 18+

### 1. Clone it

```bash
git clone https://github.com/divyansh-shandilya/Srt_Convert
cd srtconvert
npm install
```

### 2. Set up your keys

Copy the template:
```bash
cp .env.example .env.local
```

Fill in what you need. At minimum, grab a Groq API key (free) from [console.groq.com](https://console.groq.com):

```env
GROQ_API_KEY=your_groq_api_key_here
APP_URL=http://localhost:3000
JWT_SECRET=pick_something_random_and_long
```

For files over 25 MB, you'll also need a Gemini key from [aistudio.google.com](https://aistudio.google.com).

Full env template:
```env
# Transcription
GROQ_API_KEY=xxx
GEMINI_API_KEY=xxx  # optional, for files >25 MB

# Auth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# App
APP_URL=http://localhost:3000
PORT=3000
JWT_SECRET=xxx

# Cloud (optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 3. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`. The dev server runs as Express middleware, so it's just one process.

### 4. Build for production

```bash
npm run build
npm run preview  # test it locally first
```

The server serves static files from `dist/` in production.

---

## Project layout

```
├── server.ts              # Main server, API routes, transcription, auth
├── server/
│   ├── db.ts              # SQLite helpers
│   └── supabase.ts        # Supabase client
├── src/
│   ├── App.tsx            # React app — UI, upload, export
│   ├── main.tsx           # React entry + PayPal provider
│   ├── index.css          # Tailwind + design tokens
│   └── index.html         # HTML shell
├── vite.config.ts         # Vite + Tailwind
└── tsconfig.json
```

---

## Useful commands

```bash
npm run dev       # Dev server with hot reload
npm run build     # Compile for production
npm run preview   # Test the production build locally
npm run lint      # Type-check everything
npm run clean     # Delete dist/
```

---

## Database

Two databases work together:

**SQLite** — Local, zero config. Created automatically at `data/app.db`. Stores contact submissions offline-first.

**Supabase** (optional) — If you set valid credentials, submissions sync automatically. Missing tables? The app will show you the SQL to paste into your dashboard.

### Supabase schema (if needed)

```sql
CREATE TABLE contact_submissions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Google OAuth (for login)

1. Head to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web app)
3. Add `http://localhost:3000/auth/callback` to authorized redirect URIs (and your production URL later)
4. Paste the Client ID and Secret into `.env.local`

---

## PayPal subscriptions

The frontend uses a PayPal sandbox client ID by default. To switch to live payments:

1. Create a dev account at [developer.paypal.com](https://developer.paypal.com)
2. Set up a subscription plan in your dashboard
3. Replace the `clientId` in `src/main.tsx` with your live one

---

## Admin panel

There's an admin-only dashboard that lists all contact submissions from SQLite and can sync them to Supabase with one click. You can also delete individual submissions.

Access is restricted to the admin email set in `server.ts`.

---

## How transcription works

- **Files ≤25 MB** → Groq Whisper large-v3 (faster, free tier available)
- **Files >25 MB** → Google Gemini (handles bigger stuff)
- **Timeout** → 120 seconds per request, up to 5 retries
- **Uploaded files** → Stored in `uploads/` during processing, cleaned up after

---

## Things to know

- Default file size limit is **100 MB**
- Files over 25 MB need a valid `GEMINI_API_KEY`
- The Groq client lazy-loads — add the key after startup and it works on the next request (no restart needed)
- Uploaded files get cleaned up automatically after transcription

---

## License

MIT © 2026
