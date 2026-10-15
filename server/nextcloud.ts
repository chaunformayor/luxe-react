import { randomBytes } from "crypto";

// WebDAV/OCS client for the site's Nextcloud account. All paths are relative to that
// account's root, e.g. "/Tenants/Jane Doe/Lease.pdf".

export type NcItem = {
  path: string;
  name: string;
  isFolder: boolean;
  size: number;
  mimeType: string;
  modified: string | null;
  fileId: string | null;
};

function config() {
  const url = process.env.NEXTCLOUD_URL?.replace(/\/+$/, "");
  const user = process.env.NEXTCLOUD_USER;
  const pass = process.env.NEXTCLOUD_APP_PASSWORD;
  if (!url || !user || !pass) {
    throw new Error("Nextcloud is not configured (NEXTCLOUD_URL / NEXTCLOUD_USER / NEXTCLOUD_APP_PASSWORD).");
  }
  return { url, user, auth: "Basic " + Buffer.from(`${user}:${pass}`).toString("base64") };
}

export function nextcloudWebUrl(folderPath: string) {
  const { url } = config();
  return `${url}/apps/files/files?dir=${encodeURIComponent(normalizePath(folderPath))}`;
}

// ── Path helpers ──────────────────────────────────────────────────────────────

export function normalizePath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  for (const seg of parts) {
    if (seg === "." || seg === ".." || /[\\\x00-\x1f]/.test(seg)) throw new Error("Invalid path");
  }
  return "/" + parts.join("/");
}

export function joinPath(...segments: string[]) {
  return normalizePath(segments.join("/"));
}

export function parentOf(path: string) {
  const parts = normalizePath(path).split("/").filter(Boolean);
  parts.pop();
  return "/" + parts.join("/");
}

export function baseName(path: string) {
  const parts = normalizePath(path).split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

/** Makes arbitrary text safe to use as one file or folder name. */
export function safeName(name: string, fallback = "Untitled") {
  const cleaned = name
    .replace(/[\\/:*?"<>|\x00-\x1f]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[.\s]+|[.\s]+$/g, "")
    .slice(0, 150)
    .trim();
  return cleaned || fallback;
}

function encodePath(path: string) {
  return normalizePath(path).split("/").map(encodeURIComponent).join("/");
}

function filesUrl(path: string) {
  const { url, user } = config();
  return `${url}/remote.php/dav/files/${encodeURIComponent(user)}${encodePath(path)}`;
}

async function dav(method: string, url: string, init: { headers?: Record<string, string>; body?: BodyInit } = {}) {
  const { auth } = config();
  return fetch(url, { method, headers: { Authorization: auth, ...init.headers }, body: init.body });
}

function fileIdFromHeader(res: Response): string | null {
  const header = res.headers.get("oc-fileid");
  const digits = header?.match(/^\d+/)?.[0];
  return digits ? String(parseInt(digits, 10)) : null;
}

// ── PROPFIND ──────────────────────────────────────────────────────────────────

const PROPFIND_BODY = `<?xml version="1.0"?>
<d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
  <d:prop><d:resourcetype/><d:getcontentlength/><d:getcontenttype/><d:getlastmodified/><oc:fileid/><oc:size/></d:prop>
</d:propfind>`;

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function parseMultistatus(xml: string): NcItem[] {
  const { user } = config();
  const marker = `/remote.php/dav/files/${user}`;
  const items: NcItem[] = [];
  for (const match of Array.from(xml.matchAll(/<d:response>([\s\S]*?)<\/d:response>/g))) {
    const block = match[1];
    const href = decodeURIComponent(decodeXml(block.match(/<d:href>([^<]*)<\/d:href>/)?.[1] ?? ""));
    const idx = href.indexOf(marker);
    if (idx === -1) continue;
    const path = normalizePath(href.slice(idx + marker.length));
    const isFolder = /<d:collection\s*\/>/.test(block);
    const length = block.match(/<d:getcontentlength>(\d+)<\/d:getcontentlength>/)?.[1];
    const ocSize = block.match(/<oc:size>(\d+)<\/oc:size>/)?.[1];
    items.push({
      path,
      name: baseName(path),
      isFolder,
      size: Number(length ?? ocSize ?? 0),
      mimeType: isFolder ? "folder" : decodeXml(block.match(/<d:getcontenttype>([^<]*)<\/d:getcontenttype>/)?.[1] ?? ""),
      modified: block.match(/<d:getlastmodified>([^<]*)<\/d:getlastmodified>/)?.[1] ?? null,
      fileId: block.match(/<oc:fileid>(\d+)<\/oc:fileid>/)?.[1] ?? null,
    });
  }
  return items;
}

async function propfind(path: string, depth: "0" | "1") {
  const res = await dav("PROPFIND", filesUrl(path), {
    headers: { Depth: depth, "Content-Type": "application/xml" },
    body: PROPFIND_BODY,
  });
  if (res.status === 404) return null;
  if (res.status !== 207) throw new Error(`Nextcloud PROPFIND failed for ${path} (HTTP ${res.status})`);
  return parseMultistatus(await res.text());
}

export async function stat(path: string): Promise<NcItem | null> {
  const items = await propfind(path, "0");
  return items?.[0] ?? null;
}

/** Lists a folder's direct children (folders first, then files, alphabetical). Missing folder → []. */
export async function listFolder(path: string): Promise<NcItem[]> {
  const self = normalizePath(path);
  const items = (await propfind(self, "1")) ?? [];
  return items
    .filter((item) => item.path !== self)
    .sort((a, b) => (a.isFolder === b.isFolder ? a.name.localeCompare(b.name) : a.isFolder ? -1 : 1));
}

// ── Folders & files ───────────────────────────────────────────────────────────

export async function ensureFolder(path: string): Promise<void> {
  const target = normalizePath(path);
  if (target === "/") return;
  const res = await dav("MKCOL", filesUrl(target));
  if (res.status === 201 || res.status === 405) return; // 405 = already exists
  if (res.status === 409) {
    await ensureFolder(parentOf(target));
    const retry = await dav("MKCOL", filesUrl(target));
    if (retry.status === 201 || retry.status === 405) return;
    throw new Error(`Could not create folder ${target} (HTTP ${retry.status})`);
  }
  throw new Error(`Could not create folder ${target} (HTTP ${res.status})`);
}

/** Returns `path`, or "name (2).ext", "name (3).ext"… if something already exists there. */
export async function availablePath(path: string): Promise<string> {
  const dir = parentOf(path);
  const name = baseName(path);
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  for (let n = 1; n <= 50; n++) {
    const candidate = joinPath(dir, n === 1 ? name : `${stem} (${n})${ext}`);
    if (!(await stat(candidate))) return candidate;
  }
  throw new Error(`Too many files named "${name}" in ${dir}`);
}

/** Uploads a file without overwriting anything; returns where it landed. */
export async function uploadFile(path: string, data: Buffer | Uint8Array, contentType = "application/octet-stream") {
  await ensureFolder(parentOf(path));
  const finalPath = await availablePath(path);
  const res = await dav("PUT", filesUrl(finalPath), {
    headers: { "Content-Type": contentType, "If-None-Match": "*" },
    body: data as BodyInit,
  });
  if (![200, 201, 204].includes(res.status)) throw new Error(`Nextcloud upload failed for ${finalPath} (HTTP ${res.status})`);
  const fileId = fileIdFromHeader(res) ?? (await stat(finalPath))?.fileId ?? null;
  if (!fileId) throw new Error(`Uploaded ${finalPath} but could not read its file id`);
  return { path: finalPath, fileId, size: data.byteLength };
}

/** Short-lived (8 h) download link that works without a Nextcloud login. */
export async function getDirectUrl(fileId: string): Promise<string> {
  const { url, auth } = config();
  const res = await fetch(`${url}/ocs/v2.php/apps/dav/api/v1/direct`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "OCS-APIRequest": "true",
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ fileId }),
  });
  const json: any = await res.json().catch(() => null);
  const direct = json?.ocs?.data?.url;
  if (!res.ok || !direct) {
    throw new Error("That file is no longer in Nextcloud — it may have been moved to the trash or deleted.");
  }
  return direct as string;
}

export async function downloadByFileId(fileId: string): Promise<Buffer> {
  const res = await fetch(await getDirectUrl(fileId));
  if (!res.ok) throw new Error(`Nextcloud download failed (HTTP ${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

// ── Chunked uploads (Vercel caps request bodies at 4.5 MB) ───────────────────

function uploadsUrl(uploadId: string, chunk?: string) {
  if (!/^luxe-[a-f0-9]{24}$/.test(uploadId)) throw new Error("Invalid upload id");
  const { url, user } = config();
  return `${url}/remote.php/dav/uploads/${encodeURIComponent(user)}/${uploadId}${chunk ? `/${chunk}` : ""}`;
}

export async function startChunkedUpload(): Promise<string> {
  const uploadId = `luxe-${randomBytes(12).toString("hex")}`;
  const res = await dav("MKCOL", uploadsUrl(uploadId));
  if (res.status !== 201) throw new Error(`Could not start upload (HTTP ${res.status})`);
  return uploadId;
}

export async function putChunk(uploadId: string, index: number, data: Buffer) {
  if (!Number.isInteger(index) || index < 0 || index > 9999) throw new Error("Invalid chunk index");
  const res = await dav("PUT", uploadsUrl(uploadId, String(index).padStart(5, "0")), {
    headers: { "Content-Type": "application/octet-stream" },
    body: data as BodyInit,
  });
  if (![201, 204].includes(res.status)) throw new Error(`Chunk upload failed (HTTP ${res.status})`);
}

export async function finishChunkedUpload(uploadId: string, destPath: string) {
  await ensureFolder(parentOf(destPath));
  const finalPath = await availablePath(destPath);
  const res = await dav("MOVE", uploadsUrl(uploadId, ".file"), {
    headers: { Destination: filesUrl(finalPath), Overwrite: "F" },
  });
  if (![201, 204].includes(res.status)) throw new Error(`Could not finish upload (HTTP ${res.status})`);
  const item = await stat(finalPath);
  const fileId = fileIdFromHeader(res) ?? item?.fileId ?? null;
  if (!item || !fileId) throw new Error(`Upload finished but ${finalPath} was not found`);
  return { path: finalPath, fileId, size: item.size, mimeType: item.mimeType };
}

export async function abortChunkedUpload(uploadId: string) {
  await dav("DELETE", uploadsUrl(uploadId)).catch(() => {});
}
