import mysql from "mysql2/promise";
const conn = await mysql.createConnection("mysql://root:ApVSrkImENWWbMPyPEJmMvmQqCVQsBxW@sakura.proxy.rlwy.net:59056/railway");
await conn.execute(`
  CREATE TABLE IF NOT EXISTS \`newsletterSubscribers\` (
    \`id\` varchar(64) NOT NULL,
    \`email\` varchar(320) NOT NULL,
    \`createdAt\` timestamp DEFAULT (now()),
    CONSTRAINT \`newsletterSubscribers_id\` PRIMARY KEY(\`id\`),
    UNIQUE KEY \`newsletterSubscribers_email_unique\` (\`email\`)
  )
`);
console.log("newsletterSubscribers table ready");
await conn.end();
