import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import cookieParser from "cookie-parser";
import { getSupabase } from "./server/supabase.ts";
import { saveSubmission, getSubmissions, deleteSubmission, getUnsyncedSubmissions, markAsSynced } from "./server/db.ts";

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Google OAuth client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/auth/callback`
);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  console.log("Creating uploads directory at:", uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads with extension preservation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for Pro users (falling back to Gemini for files > 25MB)
  }
});

// Initialize Groq
let groq: Groq | null = null;
function initGroq() {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      console.log("Initializing Groq with API key starting with:", apiKey.substring(0, 7) + "...");
      groq = new Groq({
        apiKey: apiKey,
        timeout: 120000, // Increase timeout to 120 seconds for large files
        maxRetries: 5, // Increase retries for better resilience
      });
    } else {
      console.warn("GROQ_API_KEY is not set. Transcription will fail.");
      groq = null;
    }
  } catch (e) {
    console.error("Failed to initialize Groq:", e);
    groq = null;
  }
}

initGroq();

// Helper to format seconds to SRT timestamp
function formatSRTTime(seconds: number): string {
  const date = new Date(0);
  date.setSeconds(seconds);
  const ms = Math.floor((seconds % 1) * 1000);
  const timeString = date.toISOString().substr(11, 8);
  return `${timeString},${ms.toString().padStart(3, "0")}`;
}

// Helper to identify database connection/network error cases
function isConnError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || "").toLowerCase();
  return (
    msg.includes("fetch failed") || 
    msg.includes("getaddrinfo") || 
    msg.includes("enotfound") || 
    msg.includes("failed to fetch") ||
    msg.includes("network error")
  );
}

// API Routes
app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  console.log(`Transcription request received at ${new Date().toISOString()}`);
  let filePath: string | null = null;
  
  try {
    if (!groq) {
      // Try to re-init if key was provided later
      if (process.env.GROQ_API_KEY) {
        initGroq();
      }
      
      if (!groq) {
        return res.status(500).json({ error: "Groq API is not configured. Please set GROQ_API_KEY." });
      }
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { language = "en", threshold = "0.2" } = req.body;
    const confidenceThreshold = parseFloat(threshold);
    filePath = req.file.path;
    const stats = fs.statSync(filePath);
    console.log(`Transcribing file: ${filePath} (${(stats.size / 1024 / 1024).toFixed(2)} MB) in ${language} (Threshold: ${confidenceThreshold})`);

    // Handle files larger than 25MB using Gemini API
    if (stats.size > 25 * 1024 * 1024) {
      console.log("File size exceeds 25MB (Whisper limit). Routing transcription through standard Google Gemini API...");
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("File exceeds 25MB. A custom GEMINI_API_KEY must be configured on the server to transcribe larger files.");
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      console.log("Uploading file to Google Gemini File Store...");
      const uploadResult = await ai.files.upload({
        file: filePath,
        config: {
          mimeType: req.file.mimetype,
        }
      });

      console.log(`Uploaded to Gemini: ${uploadResult.uri}. Sparking transcription model...`);

      const prompt = `You are a professional audio and video transcriber.
Please transcribe the audio from the attached file very carefully and convert it into a highly accurate, standard SRT subtitle format.

Guidelines:
1. Output ONLY the raw SRT subtitle content.
2. Absolutely DO NOT include any markdown blocks (e.g. \`\`\`srt or \`\`\`text), intro text, or explanation. Begin directly with segment 1.
3. Every subtitle segment must have accurate, realistic start and end timestamp codes in standard SRT format:
   1
   00:00:01,000 --> 00:00:04,500
   Here goes the spoken text.
   
4. Output the subtitles in the requested language: ${language}.
5. Match the speed of speech and create comfortable segments of appropriate length. Ensure no parts are missed.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          uploadResult,
          prompt
        ]
      });

      // Cleanup Gemini storage asynchronously so we don't delay response
      ai.files.delete({ name: uploadResult.name }).catch((delErr) => {
        console.warn("Could not delete file from Gemini storage:", delErr?.message || delErr);
      });

      let srtContent = response.text || "";
      
      // Clean up potential markdown wrapper returned by Gemini
      if (srtContent.trim().startsWith("```")) {
        const lines = srtContent.trim().split("\n");
        if (lines[0].startsWith("```")) lines.shift();
        if (lines[lines.length - 1].startsWith("```")) lines.pop();
        srtContent = lines.join("\n");
      }

      console.log("Gemini transcription completed successfully. Char length:", srtContent.length);

      return res.json({ 
        srt: srtContent,
        segments: [],
        text: srtContent.replace(/\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/g, '').replace(/\n+/g, ' ').trim()
      });
    }

    // Dynamic prompt based on language to improve accuracy
    const prompts: Record<string, string> = {
      'hi': "यह एक हिंदी ऑडियो ट्रांसक्रिप्शन है। कृपया स्पष्ट और सटीक लिखें।",
      'en': "This is a professional English transcription. Preserve technical terms and maintain correct punctuation.",
      'es': "Esta es una transcripción profesional en español.",
      'fr': "Il s'agit d'une transcription professionnelle en français.",
    };

    // Call Groq Whisper API
    const fileBuffer = fs.readFileSync(filePath);
    
    const transcription = await groq.audio.transcriptions.create({
      file: await Groq.toFile(fileBuffer, req.file.originalname),
      model: "whisper-large-v3",
      response_format: "verbose_json",
      language: language,
      prompt: prompts[language] || undefined,
    });

    console.log("Transcription successful");

    const transcriptionAny = transcription as any;
    let segments = transcriptionAny.segments || [];

    // Filter segments based on confidence threshold if verbose_json provides them
    // Note: Whisper logprob is typically negative. -1.0 to 0.0 range for good segments.
    // We convert our 0-1 threshold to a logprob-like filter if possible.
    // Or we use the 'no_speech_prob' if available.
    if (segments.length > 0) {
      segments = segments.filter((s: any) => {
        // Whisper returns avg_logprob. -1.0 is decent, 0.0 is perfect.
        // If threshold is 0.85, we might want avg_logprob > -0.5
        // Let's use a simpler check if avg_logprob is available
        if (s.avg_logprob !== undefined) {
          // Hallucination filtering: -3.0 is very loose, -0.5 is very strict.
          // Defaulting to a safer range for varied audio qualities.
          const logprobThreshold = -3.0 + (confidenceThreshold * 2.5); 
          return s.avg_logprob > logprobThreshold;
        }
        return true;
      });
    }

    // Convert segments to SRT
    let srtContent = "";
    if (segments.length > 0) {
      segments.forEach((segment: any, index: number) => {
        srtContent += `${index + 1}\n`;
        srtContent += `${formatSRTTime(segment.start)} --> ${formatSRTTime(segment.end)}\n`;
        srtContent += `${segment.text.trim()}\n\n`;
      });
    } else {
      // Fallback if no segments pass filter
      srtContent = "1\n00:00:00,000 --> 00:00:10,000\n" + (transcriptionAny.text || "[No audible speech detected]");
    }

    res.json({ 
      srt: srtContent,
      segments: segments,
      text: segments.map((s: any) => s.text).join(" ") || transcriptionAny.text
    });
  } catch (error: any) {
    console.error("Transcription error details:", error);
    
    // Detailed error message for the client
    let errorMessage = "Failed to transcribe";
    if (error.status === 413) errorMessage = "File too large for Groq API (max 25MB)";
    if (error.status === 401) errorMessage = "Invalid Groq API key";
    if (error.status === 400 && error.message?.includes('file must be one of the following types')) {
      errorMessage = "Unsupported file type. Please upload one of: flac, mp3, mp4, mpeg, mpga, m4a, ogg, opus, wav, webm";
    }
    if (error.code === 'ECONNRESET' || error.message?.includes('socket hang up')) {
      errorMessage = "Connection to transcription service was lost. The file might be too large or the network is unstable. Please try again.";
    }

    res.status(error.status || 500).json({ 
      error: errorMessage,
      details: error.message,
      code: error.code
    });
  } finally {
    // Clean up uploaded file in finally block to ensure it's always deleted
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up temp file: ${filePath}`);
      } catch (e) {
        console.error("Failed to delete temp file:", e);
      }
    }
  }
});

// Health check
app.get("/api/health", async (req, res) => {
  // Re-check env var in case it was added after startup
  if (!groq && process.env.GROQ_API_KEY) {
    initGroq();
  }

  let dbStatus = "not_configured";
  let tablesMissing: string[] = [];

    const client = getSupabase();
    if (client) {
      dbStatus = "connected";
      try {
        // Check if tables exist
        const { error: profileCheck } = await client.from('profiles').select('id').limit(0);

        if (profileCheck) {
          if (isConnError(profileCheck)) {
            dbStatus = "connection_failed";
          } else if (profileCheck.code === '42P01') {
            tablesMissing.push('profiles');
          } else {
            console.error("Supabase Profile Check Error:", profileCheck.message);
            dbStatus = "error";
          }
        }

        if (dbStatus !== "connection_failed") {
          const { error: subCheck } = await client.from('subscriptions').select('id').limit(0);
          if (subCheck) {
            if (isConnError(subCheck)) {
              dbStatus = "connection_failed";
            } else if (subCheck.code === '42P01') {
              tablesMissing.push('subscriptions');
            } else if (dbStatus !== "error") {
              console.error("Supabase Subscription Check Error:", subCheck.message);
              dbStatus = "error";
            }
          }
        }

        if (dbStatus !== "connection_failed") {
          const { error: contactCheck } = await client.from('contact_submissions').select('id').limit(0);
          if (contactCheck) {
            if (isConnError(contactCheck)) {
              dbStatus = "connection_failed";
            } else if (contactCheck.code === '42P01') {
              tablesMissing.push('contact_submissions');
            } else if (dbStatus !== "error") {
              console.error("Supabase Contacts Table Check Error:", contactCheck.message);
              dbStatus = "error";
            }
          }
        }

        if (tablesMissing.length > 0 && dbStatus === "connected") {
          dbStatus = "tables_missing";
        }
      } catch (e: any) {
        if (e.message?.includes('fetch failed') || e.message?.includes('getaddrinfo') || e.message?.includes('ENOTFOUND')) {
          console.warn("Supabase connection failed (hostname not found). Disabling DB features.");
          dbStatus = "connection_failed";
        } else {
          console.error("Supabase check unexpected error:", e);
          dbStatus = "error";
        }
      }
    }

  res.json({ 
    status: "ok", 
    groqConfigured: !!process.env.GROQ_API_KEY,
    groqInitialized: !!groq,
    googleConfigured: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    database: {
      status: dbStatus,
      tablesMissing: tablesMissing
    }
  });
});

// Google OAuth Routes
app.get("/api/auth/google/url", (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: "Google OAuth not configured" });
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
  });
  res.json({ url });
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code provided");

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const client = getSupabase();
    if (payload && client) {
      try {
        // Sync user to Supabase profiles
        const { data: profile, error: profileError } = await client
          .from('profiles')
          .upsert({
            id: payload.sub, // Google unique ID
            email: payload.email,
            full_name: payload.name,
            avatar_url: payload.picture,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (profileError) {
          if (isConnError(profileError)) {
            throw new Error("Supabase is offline / unreachable. Skipping sync.");
          }
          if (profileError.code === '42P01') {
            console.warn("Supabase Setup Hint: The 'profiles' table does not exist yet.");
          } else {
            console.error("Supabase Profile Sync Error:", profileError.message);
          }
        }

        // Ensure user has a subscription record (default to free)
        const { data: sub, error: subError } = await client
          .from('subscriptions')
          .select('*')
          .eq('user_id', payload.sub)
          .maybeSingle();

        if (subError) {
          if (isConnError(subError)) {
            throw new Error("Supabase is offline / unreachable. Skipping sync.");
          }
          if (subError.code !== '42P01') {
            console.error("Supabase Subscription Check Error:", subError.message);
          }
        }

        if (!sub && !subError) {
          const { error: insertError } = await client
            .from('subscriptions')
            .insert({
              user_id: payload.sub,
              status: 'active',
              plan_id: 'free',
            });
          
          if (insertError) {
            if (isConnError(insertError)) {
              throw new Error("Supabase is offline / unreachable. Skipping sync.");
            }
            if (insertError.code !== '42P01') {
              console.error("Supabase Subscription Creation Error:", insertError.message);
            }
          }
        }
      } catch (e: any) {
        if (isConnError(e) || (e.message && e.message.includes("offline"))) {
          console.warn("Supabase database is offline or unreachable: OAuth user profile sync skipped.");
        } else {
          console.error("Supabase operation failed in OAuth callback:", e.message || e);
        }
      }
    }

    // Set cookie with user info (simplified for demo)
    res.cookie("user", JSON.stringify(payload), {
      httpOnly: false, // Allow client to read for demo
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/auth/me", async (req, res) => {
  const userCookie = req.cookies.user;
  if (userCookie) {
    try {
      const payload = JSON.parse(userCookie);
      const client = getSupabase();
      if (payload && client) {
        try {
          // Sync profile
          await client.from('profiles').upsert({
            id: payload.sub, // Google unique ID
            email: payload.email,
            full_name: payload.name || payload.full_name,
            avatar_url: payload.picture || payload.avatar_url,
            updated_at: new Date().toISOString(),
          });

          // Ensure subscription
          const { data: sub } = await client
            .from('subscriptions')
            .select('*')
            .eq('user_id', payload.sub)
            .maybeSingle();

          if (!sub) {
            await client.from('subscriptions').insert({
              user_id: payload.sub,
              status: 'active',
              plan_id: 'free',
            });
          }
        } catch (dbErr: any) {
          console.error("Self-healing background sync failed in /api/auth/me:", dbErr?.message || dbErr);
        }
      }
      res.json({ user: payload });
    } catch (e) {
      res.json({ user: null });
    }
  } else {
    res.json({ user: null });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("user", {
    secure: true,
    sameSite: "none",
  });
  res.json({ success: true });
});

// Supabase Subscription Routes
app.get("/api/subscription", async (req, res) => {
  const userCookie = req.cookies.user;
  const client = getSupabase();
  if (!userCookie || !client) {
    return res.json({ subscription: { plan_id: 'free', status: 'active' } });
  }

  try {
    const user = JSON.parse(userCookie);
    if (!user || !user.sub) {
      return res.json({ subscription: { plan_id: 'free', status: 'active' } });
    }

    const { data, error } = await client
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.sub)
      .maybeSingle();

    if (error) {
      // PGRST116 is "no rows found", 42P01 is "table missing"
      if (isConnError(error)) {
        console.warn("Supabase connection offline in /api/subscription. Defaulting to local fallback.");
      } else if (error.code === '42P01') {
        // Table missing - expected during first setup
      } else if (error.code !== 'PGRST116') {
        console.error("Supabase Fetch Subscription Error:", error.message, error.details);
      }
      return res.json({ subscription: { plan_id: 'free', status: 'active' } });
    }

    if (!data) {
      return res.json({ subscription: { plan_id: 'free', status: 'active' } });
    }

    res.json({ subscription: data });
  } catch (e: any) {
    if (e.message?.includes('fetch failed') || e.message?.includes('getaddrinfo')) {
      console.error("Supabase connection failed in /api/subscription. Check your SUPABASE_URL.");
    } else {
      console.error("Error in /api/subscription:", e);
    }
    res.json({ subscription: { plan_id: 'free', status: 'active' } });
  }
});

app.post("/api/subscription/update", async (req, res) => {
  const userCookie = req.cookies.user;
  const { plan_id, paypal_subscription_id, status } = req.body;
  const client = getSupabase();

  if (!userCookie || !client) {
    return res.status(401).json({ error: "Unauthorized or Supabase not configured" });
  }

  try {
    const user = JSON.parse(userCookie);
    const { data, error } = await client
      .from('subscriptions')
      .upsert({
        user_id: user.sub,
        plan_id: plan_id || 'pro',
        status: status || 'active',
        paypal_subscription_id: paypal_subscription_id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ subscription: data });
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: error.message });
  }
});

// Contact (Lead Generation) Endpoints
app.post("/api/contact", async (req, res) => {
  const { name, email, company, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required fields." });
  }

  try {
    // 1. Save to local SQLite database (always works, extremely stable)
    const localId = saveSubmission({
      name,
      email,
      company,
      message,
    });
    console.log(`Saved contact lead to SQLite with local id: ${localId}`);

    // 2. Record event in Supabase if database is available
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client
          .from("contact_submissions")
          .insert({
            name,
            email,
            company,
            message,
            created_at: new Date().toISOString()
          });
        if (error) {
          if (error.code === '42P01') {
            // Table doesn't exist in Supabase yet, which is fine since SQLite is the offline-friendly source of truth
            console.log("Supabase Hint: contact_submissions table does not exist in Supabase yet. SQLite was used as the fallback.");
          } else {
            console.warn("Supabase Contact Sync Issue:", error.message);
          }
        } else {
          console.log("Successfully synced contact lead to Supabase.");
          markAsSynced(localId as number);
        }
      } catch (sbErr: any) {
        console.warn("Supabase sync exception ignored (SQLite backup succeeded):", sbErr.message || sbErr);
      }
    }

    res.json({ success: true, id: localId, message: "Thank you! Your requirements have been submitted." });
  } catch (err: any) {
    console.error("Error saving contact submission:", err);
    res.status(500).json({ error: "Internal server error saving submission." });
  }
});

app.get("/api/admin/contacts", async (req, res) => {
  const userCookie = req.cookies.user;
  let isAdmin = false;

  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      if (user && user.email === "divyanshvgs0@gmail.com") {
        isAdmin = true;
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  if (!isAdmin) {
    return res.status(403).json({ error: "Access denied. Only registered administrators can view leads listings." });
  }

  try {
    const submissions = getSubmissions();
    res.json({ success: true, count: submissions.length, submissions });
  } catch (err: any) {
    console.error("Error retrieving contact submissions:", err);
    res.status(500).json({ error: "Internal server error retrieving submissions." });
  }
});

app.post("/api/admin/contacts/sync", async (req, res) => {
  const userCookie = req.cookies.user;
  let isAdmin = false;

  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      if (user && user.email === "divyanshvgs0@gmail.com") {
        isAdmin = true;
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  if (!isAdmin) {
    return res.status(403).json({ error: "Access denied." });
  }

  const client = getSupabase();
  if (!client) {
    return res.status(400).json({ error: "Supabase client is offline, key missing, or database is not configured." });
  }

  try {
    const unsynced = getUnsyncedSubmissions();
    if (unsynced.length === 0) {
      return res.json({ success: true, message: "All leads are already in sync with Supabase!", syncedCount: 0 });
    }

    let successCount = 0;
    let failCount = 0;
    let missingTable = false;

    for (const lead of unsynced) {
      const { error } = await client
        .from("contact_submissions")
        .insert({
          name: lead.name,
          email: lead.email,
          company: lead.company,
          message: lead.message,
          created_at: lead.created_at
        });

      if (error) {
        if (error.code === '42P01') {
          missingTable = true;
          break;
        } else {
          console.error("Failed to sync direct lead item:", error.message);
          failCount++;
        }
      } else {
        markAsSynced(lead.id!);
        successCount++;
      }
    }

    if (missingTable) {
      return res.status(400).json({ 
        error: "Missing Table: The 'contact_submissions' table does not exist on your new Supabase database yet. Please execute the required SQL script inside your Supabase project SQL Editor to enable this sync.",
        code: "42P01"
      });
    }

    res.json({ 
      success: true, 
      message: `Migration completed successfully! Synced ${successCount} leads to your new Supabase.`, 
      syncedCount: successCount,
      failedCount: failCount
    });
  } catch (err: any) {
    console.error("Migration/sync routine failed:", err);
    res.status(500).json({ error: err.message || "Internal server error performing database synchronization." });
  }
});

app.delete("/api/admin/contacts/:id", async (req, res) => {
  const userCookie = req.cookies.user;
  let isAdmin = false;

  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      if (user && user.email === "divyanshvgs0@gmail.com") {
        isAdmin = true;
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  if (!isAdmin) {
    return res.status(403).json({ error: "Access denied." });
  }

  try {
    const id = parseInt(req.params.id);
    const changes = deleteSubmission(id);
    res.json({ success: true, changes });
  } catch (err: any) {
    console.error("Error deleting contact submission:", err);
    res.status(500).json({ error: "Internal server error deleting submission." });
  }
});

// Global Error Handler for API routes
app.use("/api", (err: any, req: any, res: any, next: any) => {
  console.error("API Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Database initialization check
async function checkDatabase() {
  const client = getSupabase();
  if (!client) {
    console.warn("⚠️ Supabase is not configured. Database features will be disabled.");
    return;
  }

  try {
    const tables = ['profiles', 'subscriptions', 'contact_submissions'];
    const missing = [];

    for (const table of tables) {
      const { error } = await client.from(table).select('id').limit(0);
      if (error && error.code === '42P01') {
        missing.push(table);
      }
    }

    if (missing.length > 0) {
      console.error("\n" + "=".repeat(50));
      console.error("❌ DATABASE SETUP REQUIRED");
      console.error(`The following tables are missing: ${missing.join(', ')}`);
      console.error("\nACTION REQUIRED:");
      console.error("1. Open the web app in your browser.");
      console.error("2. Click the 'Get SQL Script' button in the amber banner.");
      console.error("3. Copy and run the script in your Supabase SQL Editor.");
      console.error("=".repeat(50) + "\n");
    } else {
      console.log("✅ Supabase database tables verified.");
    }
  } catch (e) {
    console.error("Failed to verify Supabase tables:", e);
  }
}

async function startServer() {
  // Check database on startup
  await checkDatabase();
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
