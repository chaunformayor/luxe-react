import { Readable } from "stream";
import { pipeline } from "stream/promises";
import express, { type Express, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sdk } from "./_core/sdk";
import * as nc from "./nextcloud";
import { getDb, getOwnerDocuments, getTenantByUserId, getTenantDocuments } from "./db";
import { documents } from "../drizzle/schema";
import { findSession, getRequest } from "./esign/service";

// Vercel rejects request bodies over 4.5 MB, so the browser sends files in chunks and
// Nextcloud reassembles them.
const MAX_CHUNK_BYTES = 4 * 1024 * 1024;

async function currentUser(req: Request) {
  return sdk.authenticateRequest(req).catch(() => null);
}

async function requireAdmin(req: Request, res: Response) {
  const user = await currentUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }
  return user;
}

function fail(res: Response, err: unknown) {
  const message = err instanceof Error ? err.message : "Request failed";
  const status = err instanceof TRPCError && err.code === "NOT_FOUND" ? 404 : 502;
  if (status === 502) console.error("[Documents]", message);
  if (!res.headersSent) res.status(status).json({ error: message });
  else res.destroy();
}

const INLINE_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/gif", "image/webp", "text/plain"]);

function contentDisposition(kind: "inline" | "attachment", fileName: string) {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `${kind}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

/**
 * Streams a Nextcloud file through this site. Downloads stay same-origin (Nextcloud's
 * "strict cookie" check breaks repeat cross-site direct links) and streaming avoids
 * Vercel's 4.5 MB response cap.
 */
async function streamFile(req: Request, res: Response, fileId: string, fileName: string) {
  const upstream = await fetch(await nc.getDirectUrl(fileId));
  if (!upstream.ok || !upstream.body) throw new Error(`Nextcloud returned HTTP ${upstream.status}`);
  const type = (upstream.headers.get("content-type") ?? "application/octet-stream").split(";")[0].trim().toLowerCase();
  const inline = INLINE_TYPES.has(type) && req.query.download === undefined;
  res.setHeader("Content-Type", type);
  res.setHeader("Content-Disposition", contentDisposition(inline ? "inline" : "attachment", fileName));
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Uploaded files are untrusted: anything that could run script stays sandboxed.
  if (type !== "application/pdf") res.setHeader("Content-Security-Policy", "sandbox; default-src 'none'; img-src 'self'; style-src 'unsafe-inline'");
  await pipeline(Readable.fromWeb(upstream.body as any), res);
}

export function registerDocumentRoutes(app: Express) {
  // ── Chunked upload (admin) ──────────────────────────────────────────────────
  app.post("/api/docs/upload/start", async (req, res) => {
    if (!(await requireAdmin(req, res))) return;
    try {
      res.json({ uploadId: await nc.startChunkedUpload() });
    } catch (err) {
      fail(res, err);
    }
  });

  app.put(
    "/api/docs/upload/:uploadId/:index",
    express.raw({ type: "application/octet-stream", limit: MAX_CHUNK_BYTES }),
    async (req, res) => {
      if (!(await requireAdmin(req, res))) return;
      try {
        if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
          res.status(400).json({ error: "Empty chunk" });
          return;
        }
        await nc.putChunk(req.params.uploadId, Number(req.params.index), req.body);
        res.json({ ok: true });
      } catch (err) {
        fail(res, err);
      }
    }
  );

  app.post("/api/docs/upload/:uploadId/finish", async (req, res) => {
    if (!(await requireAdmin(req, res))) return;
    try {
      const { folder, fileName } = req.body ?? {};
      if (typeof folder !== "string" || typeof fileName !== "string" || !fileName.trim()) {
        res.status(400).json({ error: "folder and fileName are required" });
        return;
      }
      const result = await nc.finishChunkedUpload(req.params.uploadId, nc.joinPath(folder, nc.safeName(fileName)));
      res.json(result);
    } catch (err) {
      fail(res, err);
    }
  });

  app.post("/api/docs/upload/:uploadId/abort", async (req, res) => {
    if (!(await requireAdmin(req, res))) return;
    await nc.abortChunkedUpload(req.params.uploadId);
    res.json({ ok: true });
  });

  // ── Downloads ───────────────────────────────────────────────────────────────
  // Any file in the Luxe drive (admin only).
  app.get("/api/docs/file/:fileId", async (req, res) => {
    if (!(await requireAdmin(req, res))) return;
    if (!/^\d+$/.test(req.params.fileId)) {
      res.status(400).json({ error: "Invalid file id" });
      return;
    }
    const name = typeof req.query.name === "string" && req.query.name ? req.query.name : `file-${req.params.fileId}`;
    try {
      await streamFile(req, res, req.params.fileId, name);
    } catch (err) {
      fail(res, err);
    }
  });

  // A document shared into a portal — tenants and owners only get their own.
  app.get("/api/docs/document/:documentId", async (req, res) => {
    const user = await currentUser(req);
    if (!user) {
      res.status(401).json({ error: "Please sign in" });
      return;
    }
    try {
      let doc: typeof documents.$inferSelect | undefined;
      if (user.role === "admin") {
        const db = await getDb();
        [doc] = db ? await db.select().from(documents).where(eq(documents.id, req.params.documentId)).limit(1) : [];
      } else if (user.role === "tenant") {
        const tenant = await getTenantByUserId(user.id);
        doc = tenant ? (await getTenantDocuments(tenant.id)).find((d) => d.id === req.params.documentId) : undefined;
      } else if (user.role === "owner") {
        doc = (await getOwnerDocuments(user.id)).find((d) => d.id === req.params.documentId);
      }
      if (!doc?.nextcloudFileId) {
        res.status(404).json({ error: "Document not found" });
        return;
      }
      await streamFile(req, res, doc.nextcloudFileId, doc.name);
    } catch (err) {
      fail(res, err);
    }
  });

  // ── E-signature files ───────────────────────────────────────────────────────
  // The signing token is the credential: the unsigned original while it's open, the
  // signed copy once everyone has signed.
  app.get("/api/esign/:token/:which(document|signed).pdf", async (req, res) => {
    try {
      const session = await findSession(req.params.token);
      const { which } = req.params;
      const fileId =
        which === "signed"
          ? session?.state === "completed" ? session.request.finalFileId : null
          : session && session.state !== "voided" ? session.request.sourceFileId : null;
      if (!session || !fileId) {
        res.status(404).json({ error: "Not available" });
        return;
      }
      const suffix = which === "signed" ? " (signed)" : "";
      await streamFile(req, res, fileId, `${nc.safeName(session.request.title)}${suffix}.pdf`);
    } catch (err) {
      fail(res, err);
    }
  });

  app.get("/api/esign/requests/:requestId/:which(final|source)", async (req, res) => {
    if (!(await requireAdmin(req, res))) return;
    try {
      const request = await getRequest(req.params.requestId);
      const fileId = req.params.which === "final" ? request.finalFileId : request.sourceFileId;
      if (!fileId) {
        res.status(404).json({ error: "Not available yet" });
        return;
      }
      const suffix = req.params.which === "final" ? " (signed)" : " (original)";
      await streamFile(req, res, fileId, `${nc.safeName(request.title)}${suffix}.pdf`);
    } catch (err) {
      fail(res, err);
    }
  });
}
