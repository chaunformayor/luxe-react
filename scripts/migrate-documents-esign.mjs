// Adds Nextcloud document storage + e-signature tables. Safe to re-run.
// Usage: node scripts/migrate-documents-esign.mjs   (reads DATABASE_URL from .env)
import "dotenv/config";
import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const conn = await mysql.createConnection(process.env.DATABASE_URL);

async function columnExists(table, column) {
  const [rows] = await conn.execute(
    "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [table, column]
  );
  return rows.length > 0;
}

async function addColumn(table, column, definition) {
  if (await columnExists(table, column)) {
    console.log(`exists   ${table}.${column}`);
    return;
  }
  await conn.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  console.log(`added    ${table}.${column}`);
}

// ── documents: files now live in Nextcloud ────────────────────────────────────
await conn.execute("ALTER TABLE documents MODIFY COLUMN url TEXT NULL");
await conn.execute(
  "ALTER TABLE documents MODIFY COLUMN type ENUM('lease','management_agreement','w9','lien_waiver','inspection','maintenance','invoice','other') NOT NULL"
);
console.log("modified documents.url (nullable), documents.type (new values)");
await addColumn("documents", "nextcloudPath", "VARCHAR(1024) NULL");
await addColumn("documents", "nextcloudFileId", "VARCHAR(32) NULL");
await addColumn("documents", "mimeType", "VARCHAR(150) NULL");
await addColumn("documents", "sizeBytes", "BIGINT NULL");
await addColumn("documents", "ownerUserId", "VARCHAR(64) NULL");
await addColumn("documents", "signatureRequestId", "VARCHAR(64) NULL");

// ── e-signature tables ────────────────────────────────────────────────────────
await conn.execute(`CREATE TABLE IF NOT EXISTS documentTemplates (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category ENUM('lease','management_agreement','lien_waiver','other') NOT NULL,
  description TEXT NULL,
  nextcloudPath VARCHAR(1024) NOT NULL,
  nextcloudFileId VARCHAR(32) NOT NULL,
  pageCount INT NULL,
  signerRoles JSON NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  createdBy VARCHAR(64) NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
)`);
console.log("ok       documentTemplates");

await conn.execute(`CREATE TABLE IF NOT EXISTS signatureRequests (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  kind ENUM('document','w9') NOT NULL DEFAULT 'document',
  category ENUM('lease','management_agreement','w9','lien_waiver','other') NOT NULL,
  status ENUM('sent','processing','completed','declined','voided','error') NOT NULL DEFAULT 'sent',
  message TEXT NULL,
  templateId VARCHAR(64) NULL,
  sourcePath VARCHAR(1024) NULL,
  sourceFileId VARCHAR(32) NULL,
  sourceSha256 VARCHAR(64) NULL,
  sourcePageCount INT NULL,
  folderPath VARCHAR(1024) NOT NULL,
  finalPath VARCHAR(1024) NULL,
  finalFileId VARCHAR(32) NULL,
  finalSha256 VARCHAR(64) NULL,
  sequential BOOLEAN NOT NULL DEFAULT TRUE,
  tenantId VARCHAR(64) NULL,
  ownerUserId VARCHAR(64) NULL,
  propertyId VARCHAR(64) NULL,
  documentId VARCHAR(64) NULL,
  createdBy VARCHAR(64) NULL,
  createdByName VARCHAR(255) NULL,
  createdByEmail VARCHAR(320) NULL,
  errorMessage TEXT NULL,
  voidReason TEXT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  completedAt TIMESTAMP NULL DEFAULT NULL,
  voidedAt TIMESTAMP NULL DEFAULT NULL,
  KEY idx_sigreq_status (status)
)`);
console.log("ok       signatureRequests");

await conn.execute(`CREATE TABLE IF NOT EXISTS signatureSigners (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  requestId VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  roleLabel VARCHAR(100) NULL,
  signOrder INT NOT NULL DEFAULT 1,
  token VARCHAR(64) NOT NULL,
  status ENUM('waiting','sent','viewed','signed','declined') NOT NULL DEFAULT 'waiting',
  sentAt TIMESTAMP NULL DEFAULT NULL,
  viewedAt TIMESTAMP NULL DEFAULT NULL,
  consentedAt TIMESTAMP NULL DEFAULT NULL,
  signedAt TIMESTAMP NULL DEFAULT NULL,
  declinedAt TIMESTAMP NULL DEFAULT NULL,
  lastReminderAt TIMESTAMP NULL DEFAULT NULL,
  declineReason TEXT NULL,
  signatureMethod ENUM('typed','drawn') NULL,
  printedName VARCHAR(255) NULL,
  signatureImage MEDIUMTEXT NULL,
  signedIp VARCHAR(64) NULL,
  signedUserAgent VARCHAR(512) NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_signer_token (token),
  KEY idx_signer_request (requestId)
)`);
console.log("ok       signatureSigners");

await conn.execute(`CREATE TABLE IF NOT EXISTS signatureEvents (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  requestId VARCHAR(64) NOT NULL,
  signerId VARCHAR(64) NULL,
  event VARCHAR(40) NOT NULL,
  detail TEXT NULL,
  ip VARCHAR(64) NULL,
  userAgent VARCHAR(512) NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_sigevent_request (requestId)
)`);
console.log("ok       signatureEvents");

await conn.end();
console.log("Migration complete.");
