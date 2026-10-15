import express, { type Express, type Request, type Response } from "express";
import { sdk } from "./_core/sdk";
import * as nc from "./nextcloud";

// Vercel rejects request bodies over 4.5 MB, so the browser sends files in chunks and
// Nextcloud reassembles them.
const MAX_CHUNK_BYTES = 4 * 1024 * 1024;

async function requireAdmin(req: Request, res: Response) {
  const user = await sdk.authenticateRequest(req).catch(() => null);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }
  return user;
}

function fail(res: Response, err: unknown) {
  const message = err instanceof Error ? err.message : "Upload failed";
  console.error("[Documents]", message);
  res.status(502).json({ error: message });
}

export function registerDocumentRoutes(app: Express) {
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
}
