import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { put } from "@vercel/blob";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./server/authRoutes";
import { appRouter } from "./server/routers";
import { createContext } from "./server/_core/context";
import { sdk } from "./server/_core/sdk";

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  // CSP disabled — React/Tailwind require unsafe-inline; configure explicitly if needed
  contentSecurityPolicy: false,
  // Allow embedding in same origin (needed for some portal iframes)
  crossOriginEmbedderPolicy: false,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
// General API: 300 requests per 15 min per IP
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please try again in 15 minutes." },
}));

// Login endpoint: 10 attempts per 15 min per IP (brute-force protection)
app.use("/api/auth/login", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts — please try again in 15 minutes." },
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ── File upload (property images → Vercel Blob) ───────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const user = await sdk.authenticateRequest(req).catch(() => null);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN not configured on server" });
    }

    const ext = req.file.originalname.split(".").pop() ?? "jpg";
    const filename = `properties/${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${ext}`;
    const blob = await put(filename, req.file.buffer, {
      access: "public",
      contentType: req.file.mimetype,
      token,
    });

    res.json({ url: blob.url });
  } catch (err: any) {
    console.error("[Upload]", err);
    res.status(500).json({ error: err.message ?? "Upload failed" });
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────
registerAuthRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({ router: appRouter, createContext })
);

export default app;
