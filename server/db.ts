import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the data directory exists in the workspace
const dbDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "app.db");
console.log("Initializing local SQLite database at:", dbPath);
const db = new Database(dbPath);

// Create table for contact submissions
db.exec(`
  CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    message TEXT,
    created_at TEXT NOT NULL
  )
`);

// Ensure the synced column exists for newer migrations
try {
  db.exec(`ALTER TABLE contact_submissions ADD COLUMN synced INTEGER DEFAULT 0`);
} catch (e) {
  // Ignored if column already exists
}

export interface ContactSubmission {
  id?: number;
  name: string;
  email: string;
  company?: string;
  message?: string;
  created_at?: string;
  synced?: number;
}

export function saveSubmission(submission: ContactSubmission): number | bigint {
  const stmt = db.prepare(`
    INSERT INTO contact_submissions (name, email, company, message, created_at, synced)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    submission.name,
    submission.email,
    submission.company || null,
    submission.message || null,
    submission.created_at || new Date().toISOString(),
    submission.synced || 0
  );
  return result.lastInsertRowid;
}

export function getSubmissions(): ContactSubmission[] {
  const stmt = db.prepare(`
    SELECT * FROM contact_submissions ORDER BY id DESC
  `);
  return stmt.all() as ContactSubmission[];
}

export function getUnsyncedSubmissions(): ContactSubmission[] {
  const stmt = db.prepare(`
    SELECT * FROM contact_submissions WHERE synced = 0 ORDER BY id ASC
  `);
  return stmt.all() as ContactSubmission[];
}

export function markAsSynced(id: number): void {
  const stmt = db.prepare(`
    UPDATE contact_submissions SET synced = 1 WHERE id = ?
  `);
  stmt.run(id);
}

export function deleteSubmission(id: number): number {
  const stmt = db.prepare(`
    DELETE FROM contact_submissions WHERE id = ?
  `);
  const result = stmt.run(id);
  return result.changes;
}
