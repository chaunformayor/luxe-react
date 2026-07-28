import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./server/authRoutes";
import { appRouter } from "./server/routers";
import { createContext } from "./server/_core/context";

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

// ── Routes ────────────────────────────────────────────────────────────────────
registerAuthRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({ router: appRouter, createContext })
);

export default app;
