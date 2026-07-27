import type { IncomingMessage } from "http";

// Minimal shape we need from the request object — IncomingMessage is always
// available via @types/node and avoids express-type-resolution issues on Vercel.
// Express's Request extends IncomingMessage, so callers can pass Request objects.
type ReqLike = Pick<IncomingMessage, "headers"> & { protocol?: string };

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: ReqLike) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : (forwardedProto as string).split(",");

  return protoList.some((proto: string) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: ReqLike) {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // "none" requires Secure=true; on HTTP (localhost) the browser drops it silently.
    // "lax" works for same-origin API calls on both HTTP and HTTPS.
    sameSite: (secure ? "none" : "lax") as "none" | "lax",
    secure,
  };
}
