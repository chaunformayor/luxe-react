// Lets the first signer fill in some template fields before the document is generated. Safe to re-run.
// Usage: node scripts/migrate-signer-fields.mjs   (reads DATABASE_URL from .env)
import "dotenv/config";
import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const conn = await mysql.createConnection(process.env.DATABASE_URL);

for (const [column, definition] of [
  ["fieldValues", "JSON NULL"],
  ["signerFields", "JSON NULL"],
  ["signerFieldValues", "JSON NULL"],
  ["fieldsSignerId", "VARCHAR(64) NULL"],
  ["sourceDocxFileId", "VARCHAR(32) NULL"],
]) {
  const [rows] = await conn.execute(
    "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'signatureRequests' AND COLUMN_NAME = ?",
    [column]
  );
  if (rows.length) {
    console.log(`exists   signatureRequests.${column}`);
  } else {
    await conn.execute(`ALTER TABLE signatureRequests ADD COLUMN \`${column}\` ${definition}`);
    console.log(`added    signatureRequests.${column}`);
  }
}

await conn.end();
console.log("Migration complete.");
