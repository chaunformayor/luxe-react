// Adds property type (single-family, duplex … condo) and rental type (long/mid/short-term) to
// properties, and beds/baths/sqft to units. Safe to re-run.
// Usage: node scripts/migrate-property-kinds.mjs   (reads DATABASE_URL from .env)
import "dotenv/config";
import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const conn = await mysql.createConnection(process.env.DATABASE_URL);

const columns = [
  ["properties", "propertyType", "ENUM('single_family','duplex','triplex','fourplex','multifamily','condo','townhome') NOT NULL DEFAULT 'single_family' AFTER `type`"],
  ["properties", "rentalType", "ENUM('long_term','mid_term','short_term') NOT NULL DEFAULT 'long_term' AFTER `propertyType`"],
  ["units", "beds", "INT NULL AFTER `rentAmount`"],
  ["units", "baths", "DECIMAL(3,1) NULL AFTER `beds`"],
  ["units", "sqft", "INT NULL AFTER `baths`"],
];

let addedPropertyType = false;
for (const [table, column, definition] of columns) {
  const [rows] = await conn.execute(
    "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [table, column]
  );
  if (rows.length) {
    console.log(`exists   ${table}.${column}`);
  } else {
    await conn.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`added    ${table}.${column}`);
    if (column === "propertyType") addedPropertyType = true;
  }
}

// First run only: existing listings named as condos/townhomes get that type (everything else
// starts as single-family and can be changed in Admin → Properties).
if (addedPropertyType) {
  const [condos] = await conn.execute("UPDATE properties SET propertyType = 'condo' WHERE name LIKE '%condo%'");
  const [townhomes] = await conn.execute("UPDATE properties SET propertyType = 'townhome' WHERE name LIKE '%townhome%' OR name LIKE '%townhouse%'");
  console.log(`typed    ${condos.affectedRows} condo(s), ${townhomes.affectedRows} townhome(s) by name`);
}

await conn.end();
console.log("Migration complete.");
