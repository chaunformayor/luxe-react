import mysql from "mysql2/promise";
const conn = await mysql.createConnection("mysql://root:ApVSrkImENWWbMPyPEJmMvmQqCVQsBxW@sakura.proxy.rlwy.net:59056/railway");

const images = [
  ["stl-real-estate-investing-2026", "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80&auto=format&fit=crop"],
  ["choosing-property-manager-stl",  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop"],
  ["str-vs-ltr-stl",                 "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80&auto=format&fit=crop"],
  ["rehab-roi-stl",                  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&auto=format&fit=crop"],
  ["tenant-screening-guide",         "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80&auto=format&fit=crop"],
];

for (const [slug, url] of images) {
  const [r] = await conn.execute("UPDATE blogPosts SET coverImageUrl=?, updatedAt=NOW() WHERE slug=?", [url, slug]);
  console.log(slug, r.affectedRows ? "updated" : "not found");
}

await conn.end();
console.log("Done.");
