import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { Express, Request, Response } from "express";
import { getUserByEmail, updateUser } from "./db";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [hashed, salt] = hash.split(".");
  if (!hashed || !salt) return false;
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await getUserByEmail(email.toLowerCase().trim());

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const sessionToken = await sdk.createSessionToken(user.id, {
      name: user.name || "",
      expiresInMs: ONE_YEAR_MS,
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.json({ ok: true, role: user.role, name: user.name });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ ok: true });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: (user as any).mustChangePassword ?? false,
      });
    } catch {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      const { newPassword } = req.body as { newPassword?: string };

      if (!newPassword || newPassword.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters" });
        return;
      }

      const passwordHash = await hashPassword(newPassword);
      await updateUser(user.id, { passwordHash, mustChangePassword: false });
      res.json({ ok: true });
    } catch {
      res.status(401).json({ error: "Not authenticated" });
    }
  });
}
