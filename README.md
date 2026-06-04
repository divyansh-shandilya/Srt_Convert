# SRTConvert — AI Subtitle Generator

SRTConvert turns your audio and video files into accurate, professionally timed subtitles. Upload an MP3 or MP4, pick a language, and get back a subtitle file in whatever format your workflow needs — all powered by state-of-the-art AI transcription.

---

## What it does

Drop in a media file and SRTConvert handles the rest. It transcribes the audio using Groq's Whisper large-v3 model, formats the output into precise SRT segments, and lets you download the result in a wide range of subtitle and document formats. Files larger than 25 MB are automatically routed through Google Gemini instead, so there's no practical size ceiling for Pro users.

The app supports 20 languages out of the box — English, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Russian, Japanese, Korean, Chinese, Arabic, Turkish, Hindi, Vietnamese, Thai, Indonesian, Greek, and Hebrew.

---

## Export formats

SRTConvert goes well beyond basic `.srt`. You can export your subtitles as:

**Subtitle formats** — SRT, WebVTT, Scenarist SCC (29.97 DF and NDF), Spruce STL, Advanced SubStation Alpha (ASS), TimedText TTML, QuickTime Text, Netflix DFXP, SAMI, MicroDVD, SubViewer 2.0, YouTube SBV, LRC

**Document formats** — Plain text, CSV, Word (.docx), PDF, Excel (.xlsx)

---

## Tech stack

| Layer | What's used |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express, Vite (dev middleware) |
| Transcription | Groq Whisper large-v3 (≤25 MB), Google Gemini (>25 MB) |
| Auth | Google OAuth 2.0 |
| Payments | PayPal Subscriptions |
| Database | SQLite (local, via better-sqlite3) + Supabase (cloud sync) |

---

## Getting started

**Prerequisites:** Node.js 18+

### 1. Clone and install

```bash
git clone https://github.com/divyansh-shandilya/Srt_Convert
cd srtconvert
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env.local
```

Open `.env.local` and set the following:

```env
# Required — Groq API key for transcription (files ≤25 MB)
GROQ_API_KEY=your_groq_api_key_here

# Required for files >25 MB (Pro tier)
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth (for login)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# App URL (must match your OAuth redirect URI)
APP_URL=http://localhost:3000

# Supabase (optional — used for cloud sync of contact leads)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Other
PORT=3000
JWT_SECRET=a_long_random_secret_string
```

> **Getting a Groq key:** Sign up at [console.groq.com](https://console.groq.com) — it's free to start.
> **Getting a Gemini key:** Go to [aistudio.google.com](https://aistudio.google.com) → Get API key.

### 3. Run in development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`. Vite's dev server runs as Express middleware, so there's only one process to manage.

### 4. Build for production

```bash
npm run build
npm run preview  # to test the production build locally
```

In production mode the server serves the compiled `dist/` folder as static files.

---

## Database setup

SRTConvert uses two databases in tandem:

**SQLite** runs locally with zero configuration. The `data/app.db` file is created automatically on first launch and stores contact form submissions as an offline-first source of truth.

**Supabase** is optional but recommended for cloud persistence. If you provide valid Supabase credentials, contact submissions will automatically sync there too. If any required tables are missing, the app will display a banner with an SQL script you can paste directly into your Supabase SQL Editor.

Required tables in Supabase (if used):

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

## Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID (Web application type).
3. Add `http://localhost:3000/auth/callback` as an authorized redirect URI (and your production URL when deploying).
4. Copy the Client ID and Client Secret into your `.env.local`.

---

## PayPal subscriptions

The frontend is wired to a PayPal sandbox client ID. To use real subscriptions:

1. Create a PayPal developer account at [developer.paypal.com](https://developer.paypal.com).
2. Set up a subscription plan in your PayPal dashboard.
3. Replace the `clientId` in `src/main.tsx` with your live client ID.

---

## Admin panel

An admin-only view is available to the account registered as the administrator. It lists all contact form submissions stored in SQLite and provides a one-click button to sync any unsynced leads to Supabase. You can also delete individual leads from this panel.

Access is gated to the admin email address set in `server.ts`.

---

## Project structure

```
├── server.ts          # Express server — API routes, transcription, auth, admin
├── server/
│   ├── db.ts          # SQLite helpers (save, read, sync, delete leads)
│   └── supabase.ts    # Supabase client factory with env-reload support
├── src/
│   ├── App.tsx        # Main React app — UI, upload flow, export logic
│   ├── main.tsx       # React entry point, PayPal provider
│   ├── index.css      # Tailwind + custom design tokens (light/dark)
│   └── index.html     # HTML shell
├── vite.config.ts     # Vite config with Tailwind plugin and path aliases
├── tsconfig.json      # TypeScript config
└── package.json
```

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Compile the frontend for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Type-check the project with `tsc --noEmit` |
| `npm run clean` | Delete the `dist/` directory |

---

## Notes and limits

- The default file size limit is **100 MB**, enforced by Multer on the server. Files above 25 MB require a valid `GEMINI_API_KEY`.
- Transcription uses `whisper-large-v3` with a 120-second timeout and up to 5 retries for resilience on large files.
- Uploaded files are written to a local `uploads/` directory during processing and can be cleaned up after the transcription completes.
- The Groq client is lazy-initialized — if you add the API key after first launch, the server will pick it up on the next transcription request without a restart.

---

## License

MIT © 2026 SRTConvert AI
