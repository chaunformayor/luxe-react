// Adds Word-template support (format + placeholder list) to documentTemplates. Safe to re-run.
// Usage: node scripts/migrate-template-fields.mjs   (reads DATABASE_URL from .env)
import "dotenv/config";
import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const conn = await mysql.createConnection(process.env.DATABASE_URL);

for (const [column, definition] of [
  ["format", "ENUM('pdf','docx') NOT NULL DEFAULT 'pdf'"],
  ["fields", "JSON NULL"],
  ["fieldDefaults", "JSON NULL"],
]) {
  const [rows] = await conn.execute(
    "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'documentTemplates' AND COLUMN_NAME = ?",
    [column]
  );
  if (rows.length) {
    console.log(`exists   documentTemplates.${column}`);
  } else {
    await conn.execute(`ALTER TABLE documentTemplates ADD COLUMN \`${column}\` ${definition}`);
    console.log(`added    documentTemplates.${column}`);
  }
}

await conn.end();
console.log("Migration complete.");
