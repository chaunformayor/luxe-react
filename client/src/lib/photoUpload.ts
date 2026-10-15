// Property photos go browser → /api/upload → Vercel Blob in one request, and Vercel caps request
// bodies at 4.5 MB, so big phone photos are shrunk in the browser first.
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_EDGE = 2400;
// Tried in order until the JPEG fits under MAX_BYTES.
const ATTEMPTS = [
  { edge: MAX_EDGE, quality: 0.85 },
  { edge: MAX_EDGE, quality: 0.7 },
  { edge: 1600, quality: 0.7 },
];
// Formats every visitor's browser can show; anything else (HEIC, TIFF...) is converted to JPEG.
const WEB_SAFE = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

async function loadImage(file: Blob): Promise<HTMLImageElement | null> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
    return img;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toJpeg(img: HTMLImageElement, edge: number, quality: number): Promise<Blob | null> {
  const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  // JPEG has no transparency: keep transparent PNG areas white instead of black
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
}

/** Returns the photo as-is if it's already web-ready, otherwise a resized JPEG under 4 MB. */
export async function preparePhoto(file: File): Promise<File> {
  const img = await loadImage(file);
  if (!img) {
    throw new Error(`Couldn't read ${file.name} in this browser. If it's a HEIC photo, save it as a JPEG and try again.`);
  }
  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  if (WEB_SAFE.includes(file.type) && file.size <= MAX_BYTES && longest <= MAX_EDGE) return file;

  for (const { edge, quality } of ATTEMPTS) {
    const blob = await toJpeg(img, edge, quality);
    if (blob && blob.size <= MAX_BYTES) {
      return new File([blob], file.name.replace(/\.[^.]*$/, "") + ".jpg", { type: "image/jpeg" });
    }
  }
  throw new Error(`${file.name} is too large (${mb(file.size)} MB) and couldn't be shrunk under 4 MB. Try a smaller photo.`);
}

/** Uploads one prepared photo and returns its public Blob URL. */
export async function uploadPhoto(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
  if (res.status === 413) throw new Error(`${file.name} is too large to upload (max 4 MB).`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${file.name}: ${body.error || `upload failed (HTTP ${res.status})`}`);
  return body.url;
}
